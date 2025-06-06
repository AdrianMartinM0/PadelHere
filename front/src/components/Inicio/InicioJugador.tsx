import { Link } from "react-router-dom"

const InicioJugador = () => {
  return (
    <div className="bg-white dark:bg-gray-800 h-full w-full rounded-3xl shadow-lg flex justify-center items-center relative overflow-hidden transition-colors duration-300">
      <img
        className="w-full h-full object-cover rounded-3xl transform scale-x-[-1]"
        src="./images/eresJugador.jpg"
        alt="Imagen Jugador de Padel"
      />
      <div className="bg-black/60 w-4/5 h-4/5 rounded-2xl flex flex-col justify-evenly items-center absolute p-2">
        <p className="text-white text-base sm:text-xl md:text-2xl text-center">
          ¿Eres jugador de Padel?
        </p>
        <Link to={"/sesion/register"}>
          <button className="text-white p-2 px-4 bg-[#006FFF] rounded-lg text-xs sm:text-base shadow hover:bg-blue-700 transition-colors">
            Registrarse
          </button>
        </Link>
      </div>
    </div>
  )
}

export default InicioJugador