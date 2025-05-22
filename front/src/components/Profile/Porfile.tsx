import { Link, Outlet, useLocation } from "react-router-dom"


const Porfile = () => {
   const location = useLocation();
  const getActiveClass = (path: string) =>
    location.pathname.endsWith(path)
      ? "border-b-2 px-2 border-[#155DFC]"
      : "px-2";


  return (
    <main className="h-[75vh] w-full">
      <section className="p-6 pb-0 mb-8 flex flex-col">
        <div className="flex gap-12 items-center mx-auto mb-4">
          <img className="w-28 h-28 rounded-full shadow-md mb-4" src="https://via.placeholder.com/150" alt="Foto de perfil" />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Juan Pérez</h2>
            <p className="text-gray-500 text-sm mb-2">Nivel Actual: <span className="font-semibold text-green-500">4.2</span></p>
          </div>
        </div>
          <p className="text-gray-600 mb-4 mx-auto">Apasionado del pádel y buscando siempre mejorar. 🏆</p>
        {/* <div className="flex justify-between items-center w-full mb-4">
          <div className="flex gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition flex gap-4">Solicitar Amistad <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="#ffffff" d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" /></svg></button>
          </div>
        </div> */}
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
      <article>

      </article>

      <Outlet />

    </main>
  )
}

export default Porfile