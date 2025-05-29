import { useContext, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import DefaultAvatar from "./DefaultAvatar";

const Porfile = () => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getActiveClass = (path: string) =>
    location.pathname.endsWith(path) ? "border-b-2 px-2 border-[#155DFC]" : "px-2";

  // Usar el contexto para obtener los datos
  const { email, userData, refreshUserData } = useContext(AuthContext)!;

  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Convierte el string base64 a un objeto URL para mostrar la imagen
  const getProfilePictureSrc = () => {
    if (imgPreview) return imgPreview;
    if (userData?.img_perfil) {
      try {
        return URL.createObjectURL(
          typeof userData.img_perfil === "string"
            ? new Blob([
              Uint8Array.from(atob(userData.img_perfil), c => c.charCodeAt(0))
            ])
            : userData.img_perfil
        );
      } catch {
        return "";
      }
    }
    return "";
  };
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(userData?.desc || "");

  const handleEditDesc = () => {
    setIsEditingDesc(true);
    setDescValue(userData?.desc || "");
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescValue(e.target.value);
  };

  const handleDescSave = async () => {
    if (descValue === userData?.desc) {
      setIsEditingDesc(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("email", email!);
      formData.append("desc", descValue);

      const res = await fetch("http://localhost:8000/v1/usuario/update-desc", {
      method: "POST",
      body: formData,
      });
      if (!res.ok) throw new Error("No se pudo actualizar la descripción");
      await refreshUserData();
      setIsEditingDesc(false);
    } catch (err) {
      alert("Error al actualizar la descripción");
    }
  };

  const handleDescCancel = () => {
    setIsEditingDesc(false);
    setDescValue(userData?.desc || "");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImgPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("email", email!);
    formData.append("picture", file);

    setIsUploading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/v1/usuario/update-profile-picture",
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("No se pudo actualizar la foto de perfil");
      await refreshUserData();
      setImgPreview(null);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la foto de perfil");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  // Loader si los datos no están aún cargados
  if (!userData) {
    return (
      <main className="h-[75vh] w-full flex justify-center items-center">
        <div className="text-gray-400 animate-pulse">Cargando perfil...</div>
      </main>
    );
  }

  return (
    <main className="h-[75vh] w-full">
      <section className="p-6 pb-0 mb-8 flex flex-col">
        <div className="flex gap-12 items-center mb-4 w-1/2 mx-auto">
          <div className="relative">
            {getProfilePictureSrc() === "" ? (
              <DefaultAvatar className="min-w-28 p-0 min-h-28 max-w-28 rounded-full" />
            ) : 
            <img
            className="min-w-28 p-0 min-h-28 max-w-28 rounded-full object-cover"
            src={getProfilePictureSrc()}
            alt="Logo del club"
            />
          }
            {!isUploading && (
              <div className="absolute top-0 h-28 w-28 m-0 p-0 group hover:bg-black/50 rounded-full flex items-center justify-center" onClick={triggerFileInput}>
                <svg className="w-6 opacity-0 group-hover:opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path fill="#ddd" d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z" />
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
              <div className="absolute top-0 bg-white/60 w-28 h-28 flex items-center justify-center rounded-full">
                <span className="text-lg font-bold text-blue-900 animate-pulse">Subiendo...</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{userData.name}</h2>
            <p className="text-gray-500 text-sm mb-2">
              Nivel Actual:{" "}
              <span className="font-semibold text-green-600">{userData.level}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center gap-4 mb-8">
            {isEditingDesc ? (
              <div className=" flex items-center gap-2">
                <textarea
                  className="border rounded px-2 py-1 w-92 max-h-36 text-gray-700 resize-none"
                  value={descValue}
                  onChange={handleDescChange}
                  maxLength={240}
                  autoFocus
                  style={{
                    height: "auto",
                    overflow: "hidden"
                  }}
                  ref={el => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = el.scrollHeight + "px";
                    }
                  }}
                  onInput={e => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
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
                  className="ml-1 px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={handleDescCancel}
                  title="Cancelar"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
              <p className="text-gray-600 max-w-130">{userData.desc? userData.desc : "Agrega una descripción a tu perfil para que te conozcan mejor.👌"}</p>
              <button
              className="group bg-blue-500 rounded-lg border-2 border-blue-500 hover:bg-transparent hover:rounded-full transition-all duration-500"
              onClick={handleEditDesc}
              title="Editar descripción"
            >
              <svg className="w-3 m-1 text-white group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="currentColor" d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z" />
              </svg>
            </button>
              </>
            )}
        </div>
        <ul className="flex gap-4 w-full">
          <Link to={"partidos"} state={{ from: "current" }}>
            <li className={getActiveClass("partidos")}>Partidos</li>
          </Link>
          <Link to={"logros"} state={{ from: "current" }}>
            <li className={getActiveClass("logros")}>Logros</li>
          </Link>
          <Link to={"nivel"} state={{ from: "current" }}>
            <li className={getActiveClass("nivel")}>Nivel</li>
          </Link>
        </ul>
      </section>
      <article></article>
      <Outlet />
    </main>
  );
};

export default Porfile;