import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chats } from "./Chats";
import { ChatView } from "./ChatView";
import { AuthContext } from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react"; // Usa cualquier icono de flecha que tengas o quieras

type Chat = {
  _id: string;
  partido_id: string;
  miembros: string[];
};

export const ChatPanel = () => {
  const { chat_id } = useParams<{ chat_id?: string }>();
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext)!;
  const [selectedChat, setSelectedChat] = useState<string | null>(chat_id || null);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 700);

  // Responsive: Detecta si es móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cargar los chats del usuario al montar
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/v1/chat/user/${userData?.id}`);
        if (!res.ok) throw new Error("No se pudieron cargar los chats");
        const data = await res.json();
        setChats(data);

        // Inicializa SIEMPRE todas las claves
        const initialUnread: Record<string, number> = {};
        data.forEach((chat: Chat) => {
          const unread = parseInt(localStorage.getItem(`chat_${chat._id}_unread`) || "0", 10);
          initialUnread[chat._id] = unread;
        });
        setUnreadMap(initialUnread);
      } catch (e) {
        setChats([]);
      }
      setLoading(false);
    };
    if (userData?.id) {
      fetchChats();
    }
  }, [userData]);

  // Sincroniza selectedChat cuando cambia la URL (chat_id param)
  useEffect(() => {
    if (selectedChat !== chat_id) {
      setSelectedChat(chat_id || null);
    }
  }, [chat_id, selectedChat]);

  // Marcar como leído el chat seleccionado
  useEffect(() => {
    if (selectedChat) {
      setUnreadMap((prev) => {
        const updated = { ...prev, [selectedChat]: 0 };
        localStorage.setItem(`chat_${selectedChat}_unread`, "0");
        localStorage.setItem(`chat_${selectedChat}_lastSeen`, String(Date.now()));
        return updated;
      });
    }
  }, [selectedChat]);

  // Función para incrementar mensajes sin leer en un chat (útil para WebSocket)
  const incrementUnread = (chatId: string) => {
    setUnreadMap((prev) => {
      if (selectedChat === chatId) {
        // No incremento si el chat está abierto
        return prev;
      }
      const updated = { ...prev, [chatId]: (prev[chatId] || 0) + 1 };
      localStorage.setItem(`chat_${chatId}_unread`, String(updated[chatId]));
      return updated;
    });
  };

  // WebSocket subscription
  useEffect(() => {
    if (!userData?.id) return;
    const ws = new WebSocket(`ws://localhost:8000/ws/chat`);
    ws.onopen = () => {};
    ws.onclose = () => {};
    ws.onerror = (err) => console.error("WS error", err);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { chat_id } = data;
        const chatExists = chats.some(chat => chat._id === String(chat_id));
        if (chatExists && chat_id !== selectedChat) {
          incrementUnread(String(chat_id));
        }
      } catch (e) {}
    };
    return () => ws.close();
  }, [userData?.id, chats, selectedChat]);

  // --- MOBILE RENDER LOGIC ---
  // Si es móvil y NO hay chat seleccionado: solo lista de chats
  if (isMobile && !selectedChat) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-gray-100 dark:bg-gray-900">
        <div className="w-full h-full">
          <Chats
            chats={chats}
            loading={loading}
            selectedChat={selectedChat}
            unreadMap={unreadMap}
            onSelectChat={(id: string) => {
              setSelectedChat(id);
              navigate(`/app/chats/${id}`);
            }}
          />
        </div>
      </div>
    );
  }

  // Si es móvil y SÍ hay chat seleccionado: solo chat y botón volver
  if (isMobile && selectedChat) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-gray-100 dark:bg-gray-900">
        {/* Cabecera con botón volver */}
        <div className="flex items-center p-3 bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-900 dark:to-blue-600 text-white shadow">
          <button
            className="rounded-full bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 p-2 mr-2 transition"
            onClick={() => {
              setSelectedChat(null);
              navigate("/app/chats");
            }}
            aria-label="Volver a la lista de chats"
            type="button"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold text-lg">Chat del Partido</span>
        </div>
        <div className="flex-1 flex flex-col h-0">
          <ChatView chatId={selectedChat} />
        </div>
      </div>
    );
  }

  // Desktop: ambos paneles
  return (
    <div className="flex h-[700px] w-full bg-gray-100 dark:bg-gray-900">
      {/* Lista de chats a la izquierda */}
      <div className="w-full max-w-xs border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full">
        <Chats
          chats={chats}
          loading={loading}
          selectedChat={selectedChat}
          unreadMap={unreadMap}
          onSelectChat={(id: string) => {
            setSelectedChat(id);
            navigate(`/app/chats/${id}`);
          }}
        />
      </div>
      {/* Vista del chat a la derecha */}
      <div className="flex-1 flex flex-col h-full">
        {selectedChat ? (
          <ChatView chatId={selectedChat} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <span className="text-2xl">Selecciona un chat</span>
          </div>
        )}
      </div>
    </div>
  );
};