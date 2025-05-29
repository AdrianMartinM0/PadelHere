import { Link } from "react-router-dom"


const InicioJugador = () => {
  return (
    <div className="bg-white h-full w-full rounded-4xl flex justify-center items-center relative">
        <img className="w-full h-full object-cover rounded-4xl transform scale-x-[-1]" src="./images/eresJugador.jpg" alt="Imagen Jugador de Padel" />
        <div className="bg-[#00000099] w-4/5 h-4/5 rounded-4xl flex flex-col justify-evenly items-center absolute p-2">
          <p className="text-white text-xl sm:text-3xl text-center">¿Eres jugador de Padel?</p>
          <Link to={"/sesion/register"}>
            <button className="text-white p-2 px-4 bg-[#006FFF] rounded-lg text-sm sm:text-base">
              Registrarse
            </button>
          </Link>
        </div>
    </div>
  )
}

export default InicioJugador