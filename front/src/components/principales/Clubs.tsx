import { MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import DefaultAvatar from "../Profile/DefaultAvatar"

type Club = {
  _id: string
  name: string
  direccion?: string
  img_perfil?: string
  desc?: string
}

function getMatchIndex(name: string, search: string): number {
  // Devuelve el índice de la primera coincidencia (case-insensitive), o -1 si no hay
  return name.toLowerCase().indexOf(search.toLowerCase());
}

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch("https://padelhere-production.up.railway.app/v1/club/all-clubs")
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar los clubes")
        return res.json()
      })
      .then((data: Club[]) => {
        setClubs(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const pulseCount = 3

  // Filtrado y orden por mejor coincidencia
  const filteredClubs = clubs
    .map(club => ({
      ...club,
      matchIndex: getMatchIndex(club.name, search)
    }))
    .filter(club => search.trim() === "" || club.matchIndex !== -1)
    .sort((a, b) => {
      // Si ambos tienen coincidencia, ordena por índice de coincidencia (más cerca del principio es mejor)
      if (a.matchIndex !== b.matchIndex) return a.matchIndex - b.matchIndex
      // Si empate, orden alfabético
      return a.name.localeCompare(b.name)
    })

 return (
  <div className="flex flex-col items-center justify-start gap-4 min-h-screen w-full pb-10">
    <div className="w-full mt-8 mb-4 px-2">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-lg p-6 text-white w-full">
        <h1 className="text-2xl font-bold mb-2">Clubs</h1>
        <p className="text-blue-100 dark:text-blue-200">Aquí puedes ver los clubs que estan en la web</p>
      </div>
    </div>

    {/* Input de búsqueda */}
    <div className="w-full max-w-4xl px-2 mt-2">
      <input
        type="text"
        placeholder="Buscar club por nombre..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-blue-300 dark:border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 text-blue-900 dark:text-blue-100 bg-white dark:bg-gray-900 mb-2 shadow"
        autoFocus
      />
    </div>

    {loading && (
      <div className="flex flex-col items-center gap-4 w-full">
        {[...Array(pulseCount)].map((_, idx) => (
          <div
            key={idx}
            className="border border-blue-300 dark:border-blue-900 rounded-2xl px-9 py-8 mb-3 w-full max-w-4xl min-w-[320px] bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900 dark:via-blue-950 dark:to-blue-900 shadow-xl animate-pulse min-h-[110px] flex items-center"
          >
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mr-4" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-blue-200 dark:bg-blue-800 rounded w-1/2" />
              <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )}
    {error && (
      <div className="text-center text-red-500 dark:text-red-400 py-10">Error al cargar clubes</div>
    )}
    {!loading && !error && (
      <>
        {filteredClubs.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">No hay clubes registrados.</div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            {filteredClubs.map(club => (
              <div
                key={club._id}
                className="border border-blue-600 dark:border-blue-900 rounded-2xl px-9 py-8 mb-3 w-full max-w-4xl min-w-[320px] bg-blue-50 dark:bg-blue-950 shadow-xl font-sans transition-shadow cursor-pointer hover:shadow-2xl focus:outline focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                onClick={() => navigate(`/app/club/${club._id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") navigate(`/app/club/${club._id}`)
                }}
              >
                <div className="flex items-center gap-3">
                  <div>
                    {club.img_perfil ? (
                      <img
                        src={`data:image/jpeg;base64,${club.img_perfil}`}
                        alt={club.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <DefaultAvatar/>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-bold text-blue-800 dark:text-blue-100 truncate">{club.name}</div>
                    <div className="flex gap-1 items-center text-blue-600 dark:text-blue-300 text-sm mt-1 truncate">
                      <MapPin className="w-4 h-4 text-blue-400 dark:text-blue-200" />
                      {club.direccion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
)
}
export default Clubs