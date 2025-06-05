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

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch("http://localhost:8000/v1/club/all-clubs")
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

  return (
    <div className="flex flex-col items-center justify-start gap-4 min-h-screen w-full pb-10">
      <div className="w-full mt-8 mb-4 px-2">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white w-full">
          <h1 className="text-2xl font-bold mb-2">Clubs</h1>
          <p className="text-blue-100">Aquí puedes ver los clubs que estan en la web</p>
        </div>
      </div>
      {loading && (
        <div className="flex flex-col items-center gap-4 w-full">
          {[...Array(pulseCount)].map((_, idx) => (
            <div
              key={idx}
              className="border border-blue-300 rounded-2xl px-9 py-8 mb-3 w-full max-w-4xl min-w-[320px] bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 shadow-xl animate-pulse min-h-[110px] flex items-center"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-blue-200 rounded w-1/2" />
                <div className="h-4 bg-blue-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 py-10">Error al cargar clubes</div>
      )}
      {!loading && !error && (
        <>
          {clubs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No hay clubes registrados.</div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              {clubs.map(club => (
                <div
                  key={club._id}
                  className="border border-blue-600 rounded-2xl px-9 py-8 mb-3 w-full max-w-4xl min-w-[320px] bg-blue-50 shadow-xl font-sans transition-shadow cursor-pointer hover:shadow-2xl focus:outline focus:ring-2 focus:ring-blue-500"
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
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <DefaultAvatar/>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl font-bold text-blue-800 truncate">{club.name}</div>
                      <div className="flex gap-1 items-center text-blue-600 text-sm mt-1 truncate">
                        <MapPin className="w-4 h-4 text-blue-400" />
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