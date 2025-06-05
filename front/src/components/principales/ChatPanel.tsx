import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chats } from "./Chats";
import { ChatView } from "./ChatView";
import { AuthContext } from "../../context/AuthContext";

// Define el tipo Chat (ajusta según tu backend)
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
        console.log("UnreadMap inicial:", initialUnread);
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
        console.log("No incremento porque el chat está abierto:", chatId);
        return prev;
      }
      const updated = { ...prev, [chatId]: (prev[chatId] || 0) + 1 };
      console.log("incrementUnread:", updated);
      localStorage.setItem(`chat_${chatId}_unread`, String(updated[chatId]));
      return updated;
    });
  };

  useEffect(() => {
    console.log("UnreadMap actualizado:", unreadMap)
  }, [unreadMap]);

  // WebSocket subscription: solo depende de userData?.id y chats para asegurar coincidencia correcta de chatId
  useEffect(() => {
    if (!userData?.id) return;
    const ws = new WebSocket(`ws://localhost:8000/ws/chat`);
    ws.onopen = () => console.log("WebSocket abierto");
    ws.onclose = () => console.log("WebSocket cerrado");
    ws.onerror = (err) => console.error("WS error", err);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { chat_id } = data;
        // Asegura que el chatId existe en los chats actuales
        const chatExists = chats.some(chat => chat._id === String(chat_id));
        console.log("chatId recibido:", chat_id, "¿Existe en chats?", chatExists);
        if (chatExists && chat_id !== selectedChat) {
          incrementUnread(String(chat_id));
        }
      } catch (e) {
        console.error("Error parseando mensaje WS", e);
      }
    };
    return () => ws.close();
  }, [userData?.id, chats, selectedChat]);

  return (
    <div className="flex h-[700px] w-full bg-gray-100">
      {/* Lista de chats a la izquierda */}
      <div className="w-full max-w-xs border-r bg-white h-full">
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
          <ChatView
            chatId={selectedChat}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-2xl">Selecciona un chat</span>
          </div>
        )}
      </div>
    </div>
  );
};