import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import DefaultAvatar from "../Profile/DefaultAvatar";

type Mensaje = {
  _id: string;
  chat_id: string;
  autor: string; // id de usuario
  texto: string;
  fecha: string;
  nombre?: string; // <-- puede llegar por ws
  img_perfil?: string; // <-- puede llegar por ws
};

type UserInfo = {
  nombre: string;
  img_perfil?: string; // base64
};

type UserMap = Record<string, UserInfo>;

const WS_URL = "wss://padelhere-production.up.railway.app/ws/chat";

// Convierte base64 a ObjectURL
const base64ToObjectURL = (base64: string): string => {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
};

export const ChatView = ({ chatId: propChatId }: { chatId?: string }) => {
  const params = useParams();
  const chatId = propChatId || params.chat_id || params.chatId;
  const { userData } = useContext(AuthContext)!;
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // --------- Scroll helpers ----------
  const [hasLoaded, setHasLoaded] = useState(false);
  const prevMensajesLength = useRef(0);

  // --- Cargar mensajes iniciales ---
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const res = await fetch(`https://padelhere-production.up.railway.app/v1/mensaje/chat/${chatId}/mensajes`);
      if (res.ok) {
        const data = await res.json();
        setMensajes(data);

        // Extrae autores únicos
        const uniqueIds = Array.from(new Set(data.map((m: Mensaje) => m.autor))) as string[];
        fetchUserInfos(uniqueIds);
      }
      setLoading(false);
      setHasLoaded(true); // <- Marcar como mensajes ya cargados
    };
    if (chatId) fetchMessages();
  }, [chatId]);

  // --- WebSocket: recibir mensajes en tiempo real ---
  useEffect(() => {
    if (!chatId) return;
    ws.current = new WebSocket(WS_URL);
    ws.current.onopen = () => {
      // Opcional: puedes enviar un identificador de chat al conectar si lo necesitas
    };
    ws.current.onmessage = (event) => {
      const msg: Mensaje = JSON.parse(event.data);

      // Si el mensaje recibido es para el chat actual, añádelo
      if (!msg.chat_id || msg.chat_id === chatId) {
        setMensajes((prev) => [...prev, msg]);
        // Si viene nombre e img_perfil por ws, actualiza userMap
        if (msg.autor && (msg.nombre || msg.img_perfil)) {
          setUserMap((prev) => ({
            ...prev,
            [msg.autor]: {
              nombre: msg.nombre || prev[msg.autor]?.nombre || msg.autor,
              img_perfil: msg.img_perfil || prev[msg.autor]?.img_perfil,
            }
          }));
        } else if (msg.autor && !userMap[msg.autor]) {
          // Si no viene info, intenta cargarla
          fetchUserInfos([msg.autor]);
        }
      }
    };
    return () => ws.current?.close();
    // Eliminamos userMap de las dependencias para evitar reconexiones innecesarias
    // eslint-disable-next-line
  }, [chatId]);

  // --- Obtener info de usuario (nombre y foto) ---
  const fetchUserInfos = async (ids: string[]) => {
    const idsToFetch = ids.filter(id => !userMap[id] && id !== userData?.id);
    if (idsToFetch.length === 0) return;
    const results = await Promise.all(
      idsToFetch.map(async (id) => {
        const res = await fetch(`https://padelhere-production.up.railway.app/v1/usuario/${id}`);
        if (res.ok) {
          const data = await res.json();
          return { id, nombre: data.name, img_perfil: data.img_perfil };
        }
        return { id, nombre: id, img_perfil: undefined };
      })
    );
    setUserMap((prev) =>
      results.reduce((map, { id, nombre, img_perfil }) => ({ ...map, [id]: { nombre, img_perfil } }), prev)
    );
  };

  // --- Scroll instantáneo al cargar los mensajes iniciales ---
  useEffect(() => {
    if (hasLoaded && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [hasLoaded]);

  // --- Scroll suave SOLO cuando llegan mensajes nuevos (y no en la carga inicial) ---
  useEffect(() => {
    if (
      hasLoaded &&
      mensajes.length > prevMensajesLength.current &&
      prevMensajesLength.current > 0 // sólo si no es la carga inicial
    ) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMensajesLength.current = mensajes.length;
  }, [mensajes, hasLoaded]);

  // --- Setear último mensaje leído al cargar o actualizar mensajes ---
  useEffect(() => {
    if (!chatId || !userData?.id || mensajes.length === 0) return;
    const lastMessageId = mensajes[mensajes.length - 1]?._id;
    if (!lastMessageId) return; // <-- Evita enviar 'undefined'
    // Llama al endpoint para setear el último mensaje leído (no esperes la respuesta)
    fetch(
      `https://padelhere-production.up.railway.app/v1/chat/${chatId}/last-read?user_id=${userData.id}&last_message_id=${lastMessageId}`,
      { method: "POST" }
    );
  }, [chatId, userData?.id, mensajes]);

  // --- Enviar mensaje ---
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await fetch(`https://padelhere-production.up.railway.app/v1/mensaje/chat/${chatId}/mensaje`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autor_id: userData?.id, texto: input }),
    });
    setInput("");
    // El mensaje llegará por WebSocket
  };

  // --- Obtener imagen de perfil formato src para cada usuario ---
  const getProfilePictureSrc = (userId: string, fallbackImg?: string): string | undefined => {
    if (userId === userData?.id) {
      if (userData.img_perfil) {
        if (typeof userData.img_perfil === "string") {
          return base64ToObjectURL(userData.img_perfil);
        }
      }
      return undefined;
    }
    const user = userMap[userId];
    if (user && user.img_perfil) {
      return base64ToObjectURL(user.img_perfil);
    }
    // Si el mensaje recibido trae img_perfil directamente
    if (fallbackImg) {
      return base64ToObjectURL(fallbackImg);
    }
    return undefined;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Cabecera */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-900 dark:to-blue-600 p-5 text-white flex flex-row justify-between items-center shadow-lg rounded-b-xl">
        <span className="font-bold text-2xl tracking-tight flex items-center gap-2">
          <svg className="w-7 h-7 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-3.68-.68L3 21l1.23-3.13C3.45 16.14 3 14.62 3 13c0-4.42 4.03-8 9-8s9 3.58 9 8z" />
          </svg>
          Chat del Partido
        </span>
      </div>
      {/* Mensajes */}
      <div className="flex-1 w-full flex flex-col overflow-y-auto px-2 py-4" style={{ minHeight: "0" }}>
        {loading ? (
          <div className="text-center text-gray-500 mt-10 dark:text-gray-400">Cargando mensajes...</div>
        ) : (
          <ul className="flex flex-col gap-3">
            {mensajes.map((m) => {
              const isOwn = m.autor === userData?.id;
              // Si el mensaje trae nombre/img_perfil, los usa como fallback
              const user = userMap[m.autor] || { nombre: m.nombre, img_perfil: m.img_perfil };
              return (
                <li
                  key={m._id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} items-end`}
                >
                  {/* Avatar y burbuja */}
                  {!isOwn ? (
                    <Link to={`/app/usuario/${m.autor}`}>
                      {getProfilePictureSrc(m.autor, m.img_perfil) ? (
                        <img
                          src={getProfilePictureSrc(m.autor, m.img_perfil)}
                          alt={user?.nombre || m.autor}
                          className="w-8 h-8 rounded-full mr-2 border border-blue-300 dark:border-blue-700 object-cover bg-white dark:bg-gray-900"
                          style={{ minWidth: 32, minHeight: 32 }}
                        />
                      ) : (
                        <DefaultAvatar className="w-8 h-8 mr-2" />
                      )}
                    </Link>
                  ) : null}
                  <div
                    className={`
                      px-4 py-2 rounded-xl max-w-xs shadow
                      ${isOwn
                        ? "bg-blue-500 dark:bg-blue-700 text-white rounded-br-none"
                        : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-bl-none border border-blue-200 dark:border-blue-700"}
                      transition-all
                    `}
                  >
                    {/* Nombre del autor */}
                    {!isOwn && (
                      <span className="block text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                        {user?.nombre || m.autor}
                      </span>
                    )}
                    {isOwn && (
                      <span className="block text-xs font-semibold text-right text-blue-100 dark:text-blue-200 mb-1">
                        Tú
                      </span>
                    )}
                    <span className="block text-base break-words whitespace-pre-line">{m.texto}</span>
                    <span className="block text-xs text-gray-200 dark:text-gray-400 mt-1 text-right">
                      {new Date(m.fecha).toLocaleString()}
                    </span>
                  </div>
                  {isOwn ? (
                    getProfilePictureSrc(userData.id!) ? (
                      <img
                        src={getProfilePictureSrc(userData.id!)}
                        alt="Tú"
                        className="w-8 h-8 rounded-full ml-2 border border-blue-300 dark:border-blue-700 object-cover bg-white dark:bg-gray-900"
                        style={{ minWidth: 32, minHeight: 32 }}
                      />
                    ) : (
                      <DefaultAvatar className="w-8 h-8 ml-2" />
                    )
                  ) : null}
                </li>
              );
            })}
            <div ref={bottomRef}></div>
          </ul>
        )}
      </div>
      {/* Input */}
      <form
        className="w-full flex items-center bg-white dark:bg-gray-900 p-4 border-t border-blue-100 dark:border-blue-900 shadow-lg"
        onSubmit={sendMessage}
        style={{ zIndex: 20 }}
      >
        <input
          className="flex-1 border border-blue-200 dark:border-blue-700 rounded-full px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 bg-blue-50 dark:bg-gray-800 text-gray-700 dark:text-gray-100 transition"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 150))}
          placeholder="Escribe un mensaje..."
          autoComplete="off"
          maxLength={150}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-900 dark:hover:to-blue-800 transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};