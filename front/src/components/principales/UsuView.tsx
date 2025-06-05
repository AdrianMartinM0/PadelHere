import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DefaultAvatar from "../Profile/DefaultAvatar";
import GraficaHistoryLevel from "../Profile/GraficaHistoryLevel";

type UserProfile = {
  name: string;
  level: string;
  desc?: string;
  img_perfil?: string;
};

const UsuView = () => {
  const { usu_id } = useParams<{ usu_id: string }>();

  // Estado para datos del usuario solicitado
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener los datos del usuario por el usu_id
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/v1/usuario/${usu_id}`);
        if (!res.ok) throw new Error("No se pudo cargar el usuario");
        const data = await res.json();
        setUserData(data);
      } catch {
        setUserData(null);
      }
      setLoading(false);
    };
    if (usu_id) fetchUser();
  }, [usu_id]);

  // Convierte el string base64 a un objeto URL para mostrar la imagen
  const getProfilePictureSrc = () => {
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

 // Loader si los datos no están aún cargados
  if (loading) {
    return (
      <main className="w-full">
        <section className="p-6 pb-0 mb-8 flex flex-col animate-pulse">
          {/* Avatar y datos del club */}
          <div className="flex gap-12 items-center mb-4 w-1/2 mx-auto">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gray-200" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }
  if (!userData) {
    return (
      <main className="h-[75vh] w-full flex justify-center items-center">
        <div className="text-red-400">No se pudo cargar el usuario</div>
      </main>
    );
  }

  return (
    <main className="h-[75vh] w-full">
      <section className="p-6 pb-0 mb-8 flex flex-col">
        <div className="flex gap-12 items-center mb-4 w-1/2 mx-auto">
          <div className="relative">
            {getProfilePictureSrc() === "" ? (
              <DefaultAvatar className="w-28 p-0 h-28 rounded-full" />
            ) : (
              <img
                className="w-28 p-0 h-28 rounded-full object-cover"
                src={getProfilePictureSrc()}
                alt="Logo del club"
              />
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
          <p className="text-gray-600 max-w-130">
            {userData.desc
              ? userData.desc
              : "Agrega una descripción a tu perfil para que te conozcan mejor.👌"}
          </p>
        </div>
      </section>
      <article>
        <GraficaHistoryLevel level={Number(userData.level)} id={usu_id ? usu_id.toString() : ""} />
      </article>
    </main>
  );
};

export default UsuView;