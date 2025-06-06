import { useEffect, useState } from "react";
// import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

type Chat = {
  _id: string;
  partido_id: string;
  miembros: string[];
};

type Partido = {
  _id: string;
  fecha: string;
  hora: string;
  localizacion: string;
};

interface ChatsProps {
  chats: Chat[];
  loading: boolean;
  onSelectChat?: (id: string) => void;
  selectedChat?: string | null;
  unreadMap?: Record<string, number>;
}

// --- Devuelve true si el partido es HOY o en el futuro ---
function isPartidoHoyOFuturo(fecha: string): boolean {
  // fecha en formato YYYY-MM-DD
  if (!fecha) return false;
  const [year, month, day] = fecha.split("-").map(Number);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaPartido = new Date(year, month - 1, day, 0, 0, 0, 0);
  return fechaPartido >= hoy;
}

export const Chats = ({
  chats,
  loading,
  onSelectChat,
  selectedChat,
  unreadMap = {},
}: ChatsProps) => {
  // const { userData } = useContext(AuthContext)!;
  const [partidos, setPartidos] = useState<Record<string, Partido>>({});
  const navigate = useNavigate();

  // Cargar datos de partidos SOLO si cambia la lista de chats
  useEffect(() => {
    const fetchPartidos = async () => {
      // Sacar todos los partido_id únicos no cargados
      const partidosFaltan = chats
        .map((chat: Chat) => chat.partido_id)
        .filter((id, idx, arr) => arr.indexOf(id) === idx && !(id in partidos));
      if (partidosFaltan.length > 0) {
        const nuevas: Record<string, Partido> = {};
        await Promise.all(
          partidosFaltan.map(async (partidoId: string) => {
            const resp = await fetch(
              `http://localhost:8000/v1/partido/${partidoId}`
            );
            if (resp.ok) {
              const partido = await resp.json();
              nuevas[partidoId] = {
                _id: partido._id,
                fecha: partido.fecha,
                hora: partido.hora,
                localizacion: partido.localizacion,
              };
            }
          })
        );
        setPartidos((prev) => ({ ...prev, ...nuevas }));
      }
    };
    if (chats.length > 0) {
      fetchPartidos();
    }
    // eslint-disable-next-line
  }, [chats]);

  // Filtrar los chats según la lógica pedida:
  // Solo mostrar los chats de partidos cuya fecha es HOY o en el futuro
  const filteredChats = chats.filter((chat) => {
    const partido = partidos[chat.partido_id];
    if (!partido) return true; // Mientras aún no lo hemos cargado, mostrar
    return isPartidoHoyOFuturo(partido.fecha);
  });

  return (
    <div className="flex flex-col items-center justify-start gap-4 h-full w-full pb-2">
      <div className="w-full mt-2 px-2">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-lg p-4 text-white w-full">
          <h1 className="text-2xl font-bold mb-2">Chats</h1>
          <p className="text-blue-100 dark:text-blue-200">
            Aquí puedes ver los chats a los que se te ha agregado por unirte a un partido
          </p>
        </div>
      </div>
      <div className="w-full px-2 flex-1 min-h-0">
        <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-md p-3 h-full overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-center text-blue-700 dark:text-blue-300">
            Tus Chats
          </h2>
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Cargando chats...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No tienes chats activos.
            </div>
          ) : (
            <ul className="divide-y divide-blue-100 dark:divide-blue-900">
              {filteredChats.map((chat) => {
                const partido = partidos[chat.partido_id];
                const unread = unreadMap[chat._id] || 0;
                return (
                  <li
                    key={chat._id}
                    className={`py-3 cursor-pointer transition ${
                      selectedChat === chat._id
                        ? "bg-blue-100 dark:bg-blue-950 ring-2 ring-blue-500 dark:ring-blue-900 rounded-md"
                        : ""
                    }`}
                    onClick={() => {
                      onSelectChat?.(chat._id);
                      navigate(`/app/chats/${chat._id}`);
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg p-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                          Chat de partido
                          {unread > 0 && (
                            <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow">
                              {unread}
                            </span>
                          )}
                        </span>
                        {partido ? (
                          <>
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              <strong>Fecha:</strong> {partido.fecha} &nbsp;
                              <strong>Hora:</strong> {partido.hora}
                            </span>
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              <strong>Lugar:</strong> {partido.localizacion}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Cargando detalles del partido...
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Miembros: {chat.miembros.length}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};