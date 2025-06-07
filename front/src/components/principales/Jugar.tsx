import { useContext, useEffect, useRef, useState } from "react"
import { Plus, MapPin, Calendar, Clock, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

type Club = {
  id: string
  name: string
  desc?: string
}

type UserProfile = {
  _id: string
  name: string
  img_perfil?: string
}

type Partido = {
  _id: string
  localizacion: string
  fecha: string
  hora: string
  created_by: string
  pareja1_jugador1?: string
  pareja1_jugador2?: string
  pareja2_jugador1?: string
  pareja2_jugador2?: string
  created_at: string
  updated_at: string
}

// --- Utilidad para mostrar fecha/hora en la zona de Madrid ---
const formatDateMadrid = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
};

const getNowInMadrid = () => {
  const madridStr = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Madrid" }).replace(" ", "T");
  return new Date(madridStr);
};

const isPartidoFuturo = (partido: Partido) => {
  if (!partido.fecha || !partido.hora) return false
  const partidoDate = new Date(`${partido.fecha}T${partido.hora}:00`);
  const nowMadrid = getNowInMadrid();
  return partidoDate.getTime() > nowMadrid.getTime();
}

const isPartidoIncompleto = (partido: Partido) => {
  // Devuelve true si algún slot está vacío (no hay 4 jugadores)
  return !(
    partido.pareja1_jugador1 &&
    partido.pareja1_jugador2 &&
    partido.pareja2_jugador1 &&
    partido.pareja2_jugador2
  );
};

const getPartidoDate = (partido: Partido) => {
  if (!partido.fecha || !partido.hora) return new Date(0)
  return new Date(`${partido.fecha}T${partido.hora}:00`)
}

const Jugar = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [formData, setFormData] = useState({
    localizacion: "",
    fecha: "",
    hora: "",
    maxPlayers: 4,
  })

  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loadingPartidos, setLoadingPartidos] = useState(true)
  const [userCache, setUserCache] = useState<Record<string, UserProfile>>({})

  const { userData } = useContext(AuthContext)!;
  const navigate = useNavigate()
  const wsRef = useRef<WebSocket | null>(null);

  // --- fetchPartidos: muestra todos los partidos incompletos y no pasados ---
  const fetchPartidos = async () => {
    setLoadingPartidos(true)
    try {
      const res = await fetch("http://localhost:8000/v1/partido/")
      if (!res.ok) throw new Error("No se pudieron cargar los partidos")
      let data = await res.json()
      data = data
        .filter((p: Partido) => {
          // Mostrar todos los partidos que no estén completos y no estén pasados
          return isPartidoFuturo(p) && isPartidoIncompleto(p);
        })
        .sort((a: Partido, b: Partido) => getPartidoDate(a).getTime() - getPartidoDate(b).getTime())
      setPartidos(data)
      // Refresca usuarios de todos los slots de la lista visible
      const allIds = new Set<string>()
      data.forEach((p: Partido) => {
        [p.pareja1_jugador1, p.pareja1_jugador2, p.pareja2_jugador1, p.pareja2_jugador2]
          .forEach((slot) => {
            if (slot && typeof slot === "string") allIds.add(slot)
          })
      })
      const idsToFetch = Array.from(allIds).filter(id => !(id in userCache))
      if (idsToFetch.length > 0) {
        Promise.all(
          idsToFetch.map(id =>
            fetch(`http://localhost:8000/v1/usuario/${id}`)
              .then(res => res.ok ? res.json() : null)
              .then(profile => profile ? { id, profile } : null)
          )
        ).then(results => {
          const newCache: Record<string, UserProfile> = {}
          results.forEach(res => {
            if (res && res.profile) {
              newCache[res.id] = res.profile
            }
          })
          setUserCache(prev => ({ ...prev, ...newCache }))
        })
      }
    } catch (error) {
      setPartidos([])
    }
    setLoadingPartidos(false)
  }

  useEffect(() => {
    if (wsRef.current) return;
    const ws = new WebSocket("ws://localhost:8000/ws/partidos");
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "new_player") {
          fetchPartidos();
        }
      } catch (e) {}
    };
    ws.onclose = () => { wsRef.current = null; };
    return () => { ws.close(); };
  }, []);

  useEffect(() => {
    fetchPartidos();
  }, []);

  useEffect(() => {
    if (userData !== undefined) {
      fetchPartidos();
    }
  }, [userData]);

  const handleOpenCreateForm = () => {
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(false)
    setShowCreateForm(true)
  }

  const handleCloseCreateForm = () => {
    setCreateError(null)
    setCreateSuccess(null)
    setShowCreateForm(false)
    setIsCreating(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCreating) return;
    setIsCreating(true)
    setCreateError(null)
    setCreateSuccess(null)
    try {
      const body = {
        localizacion: formData.localizacion,
        fecha: formData.fecha,
        hora: formData.hora,
      }
      const userId = userData?.id

      const res = await fetch(
        `http://localhost:8000/v1/partido/?user_id=${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Error creando el partido")
      }

      await fetchPartidos();

      setCreateSuccess("¡Partido creado correctamente!")
      setFormData({
        localizacion: "",
        fecha: "",
        hora: "",
        maxPlayers: 4,
      })
      setSelectedClub(null)
      setTimeout(() => {
        handleCloseCreateForm()
      }, 1200)
    } catch (error: any) {
      setCreateError(error.message || "Error inesperado")
      setIsCreating(false)
    }
  }

  const handleJoin = async (partidoId: string, slot: string) => {
    try {
      const userId = userData?.id;
      if (!userId) return console.error("Debes iniciar sesión para unirte.");
      const res = await fetch(`http://localhost:8000/v1/partido/${partidoId}/join/${slot}?user_id=${userId}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("No se pudo unir al partido");
      // No hace falta recargar aquí: el WebSocket lo hará
    } catch (e) {
      console.error("Error al unirse al partido");
    }
  }

  // NUEVO: función para salir de un partido en el slot correspondiente
  const handleLeave = async (partidoId: string, slot: string) => {
    try {
      const userId = userData?.id;
      if (!userId) return console.error("Debes iniciar sesión para salir.");
      const res = await fetch(`http://localhost:8000/v1/partido/${partidoId}/leave/${slot}?user_id=${userId}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("No se pudo salir del partido");
      // El WebSocket actualizará los slots
    } catch (e) {
      console.error("Error al salir del partido");
    }
  }

  const LeaveButton = ({ partidoId, slot }: { partidoId: string, slot: string }) => (
    <button
      className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center bg-white text-red-600 hover:bg-red-100 transition absolute -top-2 -right-2 z-10"
      title="Salir del partido"
      onClick={() => handleLeave(partidoId, slot)}
      style={{ fontSize: 12, lineHeight: 1, padding: 0 }}
    >
      <X size={16} className="text-red-600" strokeWidth={3} />
    </button>
  );

  const PlayerCircle = ({
    userId,
    partidoId,
    slot
  }: {
    userId: string | null | undefined,
    partidoId: string,
    slot: string
  }) => {
    const isOwnSlot = userId && userData?.id && userId === userData.id;
    const profile = userId ? userCache[userId] : undefined;

    return (
      <div className="relative flex items-center justify-center">
        {isOwnSlot && <LeaveButton partidoId={partidoId} slot={slot} />}
        {!userId ? (
          <button
            className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900 transition"
            title="Unirse"
            onClick={() => handleJoin(partidoId, slot)}
          >
            <Plus size={28} className="text-blue-600 dark:text-blue-300" />
          </button>
        ) : (
          <Link
            to={`/app/usuario/${userId}`}
            className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition"
            title={profile?.name}
            onClick={() => navigate(`/perfil/${userId}`)}
            type="button"
          >
            {profile?.img_perfil ? (
              <img
                src={`data:image/jpeg;base64,${profile.img_perfil}`}
                alt={profile.name || "Jugador"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">
                {profile?.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </Link>
        )}
      </div>
    );
  };

  const PartidoCard = (partido: Partido) => {
    return (
      <div
        key={partido._id}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-md mb-6 flex flex-row items-center w-full min-h-[164px] border border-blue-600 dark:border-blue-900 py-4 px-2"
      >
        <div className="flex flex-col justify-center items-center gap-5 w-20">
          <PlayerCircle userId={partido.pareja1_jugador1 ?? null} partidoId={partido._id} slot="pareja1_jugador1" />
          <PlayerCircle userId={partido.pareja1_jugador2 ?? null} partidoId={partido._id} slot="pareja1_jugador2" />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center px-2 text-center">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 font-semibold text-lg mb-3 justify-center">
            <MapPin size={18} />
            {partido.localizacion}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 text-gray-700 dark:text-gray-200 text-base mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={16} /> {partido.fecha}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} /> {partido.hora}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 justify-center">
            <span>Creado el {formatDateMadrid(partido.created_at)}</span>
            <span>Actualizado el {formatDateMadrid(partido.updated_at)}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-5 w-20">
          <PlayerCircle userId={partido.pareja2_jugador1 ?? null} partidoId={partido._id} slot="pareja2_jugador1" />
          <PlayerCircle userId={partido.pareja2_jugador2 ?? null} partidoId={partido._id} slot="pareja2_jugador2" />
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md mb-6 flex flex-row items-center w-full min-h-[164px] border border-blue-300 dark:border-blue-900 py-4 px-2 animate-pulse">
      <div className="flex flex-col justify-center items-center gap-5 w-20">
        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900" />
        <div className="w-12 h-12 rounded-full border-2 border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-gray-800" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center px-2 text-center gap-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/6 mb-1" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/6" />
      </div>
      <div className="flex flex-col justify-center items-center gap-5 w-20">
        <div className="w-12 h-12 rounded-full border-2 border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-gray-800" />
        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-start gap-4 min-h-screen w-full pb-10">
      <div className="w-full mt-8 mb-4 px-2">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-lg p-6 text-white w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold mb-2">¿Listo para jugar?</h1>
              <p className="text-blue-100 dark:text-blue-200">Crea un nuevo partido o únete a uno existente</p>
            </div>
            <button
              onClick={handleOpenCreateForm}
              className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus size={20} />
              Crear Partido
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-2">
        <div className="w-full bg-[#fff6] dark:bg-[#111a] rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Partidos Disponibles</h2>
          {loadingPartidos ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : partidos.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">No hay partidos disponibles por ahora.</div>
          ) : (
            partidos.map((partido) => PartidoCard(partido))
          )}
        </div>
      </div>

      {showCreateForm && (
        <>
          <div
            className="fixed inset-0 bg-[#ACD3FF] bg-opacity-50 dark:bg-[#1a273a]/60 z-40"
            onClick={handleCloseCreateForm}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Crear Nuevo Partido</h2>
                </div>

                {createError && (
                  <div className="mb-2 text-red-600 dark:text-red-400 font-medium">{createError}</div>
                )}
                {createSuccess && (
                  <div className="mb-2 text-green-600 dark:text-green-400 font-medium">{createSuccess}</div>
                )}

                <form onSubmit={handleCreateMatch} className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      Ubicación
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="localizacion"
                        value={formData.localizacion}
                        onChange={handleInputChange}
                        placeholder="Ej: Madrid, Parque del Oeste..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                        required
                        disabled={!!selectedClub}
                      />
                    </div>
                    {selectedClub && (
                      <div className="mt-1 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <MapPin size={14} /> Club seleccionado: <span className="font-semibold">{selectedClub.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      min={new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      <Clock size={16} className="inline mr-1" />
                      Hora
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={formData.hora}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseCreateForm}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      disabled={isCreating}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-800 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors"
                      disabled={isCreating}
                    >
                      {isCreating ? "Creando..." : "Crear Partido"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default Jugar