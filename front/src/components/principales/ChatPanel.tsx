import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chats } from "./Chats";
import { ChatView } from "./ChatView";
import { AuthContext } from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react";

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

  // Refs para acceder al valor actualizado en los callbacks
  const selectedChatRef = useRef(selectedChat);
  const chatsRef = useRef(chats);

  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);
  useEffect(() => { chatsRef.current = chats; }, [chats]);

  // Responsive: Detecta si es móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Función para obtener los contadores de mensajes no leídos
  const fetchUnreadCounts = useCallback(async (chatList: Chat[], userId: string) => {
    const map: Record<string, number> = {};
    await Promise.all(
      chatList.map(async (chat) => {
        try {
          const resp = await fetch(
            `https://padelhere-production.up.railway.app/v1/chat/${chat._id}/unread-count/${userId}`
          );
          if (resp.ok) {
            const json = await resp.json();
            map[chat._id] = json.unread_count ?? 0;
          } else {
            map[chat._id] = 0;
          }
        } catch {
          map[chat._id] = 0;
        }
      })
    );
    setUnreadMap(map);
  }, []);

  // Cargar los chats del usuario al montar
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://padelhere-production.up.railway.app/v1/chat/user/${userData?.id}`);
        if (!res.ok) throw new Error("No se pudieron cargar los chats");
        const data = await res.json();
        setChats(data);

        if (userData?.id) {
          fetchUnreadCounts(data, userData.id);
        }
      } catch (e) {
        setChats([]);
        setUnreadMap({});
      }
      setLoading(false);
    };
    if (userData?.id) {
      fetchChats();
    }
    // eslint-disable-next-line
  }, [userData]);

  // Sincroniza selectedChat cuando cambia la URL (chat_id param)
  useEffect(() => {
    if (selectedChat !== chat_id) {
      setSelectedChat(chat_id || null);
    }
  }, [chat_id, selectedChat]);

  // Marcar como leído el chat seleccionado (y refetch del contador tras pequeño delay)
  useEffect(() => {
    if (selectedChat && userData?.id) {
      const markReadAndRefetch = async () => {
        try {
          await fetch(
            `https://padelhere-production.up.railway.app/v1/chat/${selectedChat}/mark-read/${userData.id}`,
            { method: "PATCH" }
          );
        } catch {}
        setUnreadMap((prev) => ({ ...prev, [selectedChat]: 0 }));
        setTimeout(() => {
          fetchUnreadCounts(chatsRef.current, userData.id);
        }, 300);
      };
      markReadAndRefetch();
    }
    // eslint-disable-next-line
  }, [selectedChat, userData]);

  // Función para incrementar mensajes sin leer en un chat (solo WebSocket)
  const incrementUnread = useCallback((chatId: string) => {
    setUnreadMap((prev) => {
      // Solo incrementa si no es el chat abierto
      if (selectedChatRef.current === chatId) return prev;
      return { ...prev, [chatId]: (prev[chatId] || 0) + 1 };
    });
  }, []);

  // WebSocket subscription: incrementa el contador SOLO del chat recibido
  useEffect(() => {
    if (!userData?.id) return;
    const ws = new WebSocket(`ws://padelhere-production.up.railway.app/ws/chat`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { chat_id } = data;
        const chatExists = chatsRef.current.some(chat => chat._id === String(chat_id));
        if (chatExists) {
          incrementUnread(String(chat_id));
        }
      } catch (e) {}
    };
    return () => ws.close();
    // eslint-disable-next-line
  }, [userData?.id, incrementUnread]);

  // --- MOBILE RENDER LOGIC ---
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