import type React from "react"
import { useContext, useRef, useState } from "react"
import { AuthContext } from "../../../context/AuthContext"
import { ExternalLink, MapPin, Phone, Settings } from "lucide-react"
import DefaultAvatar from "../DefaultAvatar"
import Pistas from "./Pistas"

const ClubProfile = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { email, clubData, refreshUserData, userData } = useContext(AuthContext)!

  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)


  // Botón de ajustes para mostrar/ocultar el bloque de eliminar cuenta
  const [showDelete, setShowDelete] = useState(false);
  // Estado para modal de confirmación
  const [showModal, setShowModal] = useState(false);

  // Convierte el string base64 a un objeto URL para mostrar la imagen
  const getProfilePictureSrc = () => {
    if (imgPreview) return imgPreview
    if (clubData?.img_perfil) {
      try {
        return URL.createObjectURL(
          typeof clubData.img_perfil === "string"
            ? new Blob([Uint8Array.from(atob(clubData.img_perfil), (c) => c.charCodeAt(0))])
            : clubData.img_perfil,
        )
      } catch {
        return ""
      }
    }
    return ""
  }

  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState(clubData?.desc || "")

  const handleEditDesc = () => {
    setIsEditingDesc(true)
    setDescValue(clubData?.desc || "")
  }

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescValue(e.target.value)
  }

  const handleDescSave = async () => {
    if (descValue === clubData?.desc) {
      setIsEditingDesc(false)
      return
    }
    try {
      const formData = new FormData()
      formData.append("email", email!)
      formData.append("desc", descValue)

      const res = await fetch("http://localhost:8000/v1/club/update-desc", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("No se pudo actualizar la descripción")
      await refreshUserData()
      setIsEditingDesc(false)
    } catch (err) {
      alert("Error al actualizar la descripción")
    }
  }

  const handleDescCancel = () => {
    setIsEditingDesc(false)
    setDescValue(clubData?.desc || "")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImgPreview(URL.createObjectURL(file))
    const formData = new FormData()
    formData.append("email", email!)
    formData.append("picture", file)

    setIsUploading(true)

    try {
      const res = await fetch("http://localhost:8000/v1/club/update-profile-picture", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("No se pudo actualizar la foto de perfil")
      await refreshUserData()
      setImgPreview(null)
    } catch (err) {
      console.error(err)
      alert("Error al actualizar la foto de perfil")
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  // Loader si los datos no están aún cargados
  if (!clubData) {
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
            <div className="w-full h-48 rounded-lg shadow-lg overflow-hidden border border-blue-600 bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 flex items-center justify-between">
              <div className="h-4 w-2/5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>

          {/* Skeleton Pistas */}
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
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border-blue-400 p-6">
              {[...Array(7)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2 overflow-hidden">
                  <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                  {[...Array(7)].map((_, idy) => (
                    <div key={idy} className="min-w-30 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] pb-12 w-full">
      <section className="p-6 pb-0 mb-8 flex flex-col relative">
        {/* ----- PERFIL: info usuario + botón settings a la derecha ----- */}
        <div className="flex flex-col lg:flex-row items-center mb-4 w-full lg:w-1/2 mx-auto justify-between gap-4">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-12 w-full lg:w-auto">
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
              {!isUploading && (
                <div
                  className="absolute top-0 h-28 w-28 m-0 p-0 group hover:bg-black/50 dark:hover:bg-white/20 rounded-full flex items-center justify-center"
                  onClick={triggerFileInput}
                >
                  <svg
                    className="w-6 opacity-0 group-hover:opacity-100 text-gray-200 dark:text-gray-100"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path
                      fill="currentColor"
                      d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"
                    />
                  </svg>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="absolute top-0 bg-white/60 dark:bg-black/60 w-28 h-28 flex items-center justify-center rounded-full">
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-200 animate-pulse">Subiendo...</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{clubData.name}</h2>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm mb-1">
                <MapPin size={16} />
                <span>{clubData.direccion}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm">
                <Phone size={16} />
                <span>{clubData.tel}</span>
              </div>
            </div>
          </div>
          {/* Botón ajustes*/}
          <button
            className="rounded-full px-2 py-2 bg-gray-600 dark:bg-gray-700 text-white flex items-center mt-3 lg:mt-0"
            onClick={() => setShowDelete(v => !v)}
            title="Ajustes"
          >
            <Settings className="w-6" />
          </button>
        </div>
        {/* Bloque de eliminar cuenta, alineado completamente a la derecha fuera del w-1/2 */}
        {showDelete &&
          <div
            className="fixed z-[9999] inset-0 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDelete(false)}
          >
            <div
              className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-xs flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-2xl"
                onClick={() => setShowDelete(false)}
                aria-label="Cerrar"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Ajustes de cuenta</h2>
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition"
                onClick={() => {
                  setShowDelete(false);
                  setShowModal(true);
                }}
              >
                Eliminar perfil
              </button>
              <span className="mt-2 text-gray-500 dark:text-gray-300 self-center text-sm">Esta acción es irreversible.</span>
            </div>
          </div>
        }

        {showModal &&
          <div
            className="fixed z-[9999] inset-0 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-xs flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-2xl"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
              >
              </button>
              <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4">¿Eliminar perfil?</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-200 text-center">
                Esta acción no se puede deshacer. ¿Seguro que quieres eliminar tu perfil?
              </p>
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
                  onClick={async () => {
                    try {
                      const res = await fetch(`http://localhost:8000/v1/usuario/${userData?.id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                      });
                      if (!res.ok) throw new Error("No se pudo eliminar el perfil");
                      window.location.href = "/logout";
                    } catch {
                      alert("Error al eliminar el perfil");
                    }
                  }}
                >
                  Eliminar definitivamente
                </button>
              </div>
            </div>
          </div>
        }

        {/* Descripcion  */}
        <div className="flex justify-center items-center gap-4 mb-8">
          {isEditingDesc ? (
            <div className="flex items-center gap-2">
              <textarea
                className="border rounded px-2 py-1 w-92 max-h-36 text-gray-700 dark:text-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 resize-none"
                value={descValue}
                onChange={handleDescChange}
                maxLength={240}
                autoFocus
                style={{
                  height: "auto",
                  overflow: "hidden",
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto"
                    el.style.height = el.scrollHeight + "px"
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = target.scrollHeight + "px"
                }}
              />
              <button
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleDescSave}
                disabled={descValue.trim() === ""}
                title="Guardar"
              >
                Guardar
              </button>
              <button
                className="ml-1 px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={handleDescCancel}
                title="Cancelar"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-200 max-w-130">
                {clubData.desc
                  ? clubData.desc
                  : "Agrega una descripción de tu club para que te conozcan mejor.👌"}
              </p>
              <button
                className="group bg-blue-500 rounded-lg border-2 border-blue-500 hover:bg-transparent hover:rounded-full transition-all duration-500"
                onClick={handleEditDesc}
                title="Editar descripción"
              >
                <svg
                  className="w-3 m-1 text-white group-hover:text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Iframe mapa */}
        <div className="w-8/10 mx-auto mb-8 mt-2">
          <div className="w-full h-48 rounded-lg shadow-lg overflow-hidden border border-blue-600">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(clubData.direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación de ${clubData.name}`}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-200 text-sm">{clubData.direccion}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clubData.direccion)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1"
            >
              <span>Ver en Maps</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Pistas */}
        <Pistas clubId={clubData.id} />

      </section>
    </main>
  )
}

export default ClubProfile
