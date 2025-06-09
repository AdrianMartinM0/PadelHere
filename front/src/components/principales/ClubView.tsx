import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ExternalLink, MapPin, Phone } from "lucide-react"
import DefaultAvatar from "../Profile/DefaultAvatar"
import Pistas from "../Profile/Club/Pistas"

type Club = {
  id: string
  name: string
  desc?: string
  direccion?: string
  email?: string
  tel?: string | number
  img_perfil?: string // base64 string
}

const ClubView = () => {
  const { club_id } = useParams<{ club_id: string }>()
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!club_id) return
    fetch(`https://padelhere-production.up.railway.app/v1/club/all-clubs/${club_id}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar el club")
        return res.json()
      })
      .then((data: any) => {
        if (data._id && !data.id) data.id = data._id
        setClub(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [club_id])

  // Loader si los datos no están aún cargados
  if (loading) {
    return (
      <main className="w-full">
        <section className="p-6 pb-0 mb-8 flex flex-col animate-pulse">
          {/* Avatar y datos del club */}
          <div className="flex gap-12 items-center mb-4 w-1/2 mx-auto">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>

          {/* Iframe mapa skeleton */}
          <div className="w-8/10 mx-auto mb-8 mt-2">
            <div className="w-full h-48 rounded-lg shadow-lg overflow-hidden border border-blue-600 dark:border-blue-900 bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 flex items-center justify-between">
              <div className="h-4 w-2/5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>

          {/* Skeleton Pistas (imitando varios DayRow) */}
          <div className="container mx-auto pr-6 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6 mt-6" />
            <div className="flex gap-4 mb-8">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 mt-6" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6 mt-6" />
            <div className="flex items-center justify-between my-2 px-2" >
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-36" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-36" />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border-blue-400 dark:border-blue-900 p-6">
              {[...Array(7)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2 overflow-hidden">
                  <div className="w-24 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
                  {[...Array(7)].map((_, idy) => (
                    <div key={idy} className="min-w-30 h-8 bg-gray-200 dark:bg-gray-800 rounded-md" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    )
  }
  if (error) {
    return (
      <main className="h-[75vh] w-full flex justify-center items-center">
        <div className="text-red-400 dark:text-red-300">{error}</div>
      </main>
    )
  }
  if (!club) {
    return (
      <main className="h-[75vh] w-full flex justify-center items-center">
        <div className="text-gray-400 dark:text-gray-500">Club no encontrado</div>
      </main>
    )
  }

  const getProfilePictureSrc = () => {
    if (club.img_perfil) {
      return `data:image/jpeg;base64,${club.img_perfil}`
    }
    return ""
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] pb-4 w-full">
      <section className="p-6 pb-0 mb-8 flex flex-col relative">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 items-center mb-2 w-1/2 mx-auto">
          <div className="relative">
            {getProfilePictureSrc() === "" ? (
              <DefaultAvatar className="w-28 p-0 h-28 rounded-full" />
            ) : (
              <img
                className="w-28 h-28 rounded-full object-cover"
                src={getProfilePictureSrc()}
                alt="Logo del club"
              />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{club.name}</h2>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm mb-1">
              <MapPin size={16} />
              <span>{club.direccion}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm">
              <Phone size={16} />
              <span>{club.tel}</span>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <p className="text-gray-600 dark:text-gray-200 max-w-130">
            {club.desc
              ? club.desc
              : "Este club aún no tiene una descripción pública."}
          </p>
        </div>

        {/* Mapa */}
        <div className="w-8/10 mx-auto mb-8 mt-2">
          <div className="w-full h-48 rounded-lg shadow-lg overflow-hidden border border-blue-600 dark:border-blue-900">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(club.direccion || "")}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación de ${club.name}`}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-300 text-sm">{club.direccion}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.direccion || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
            >
              <span>Ver en Maps</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Pistas */}
        <Pistas clubId={club.id} />
      </section>
    </main>
  )
}

export default ClubView