const InicioClub = () => {
  return (
    <div className="bg-white dark:bg-gray-800 h-full w-full rounded-3xl shadow-lg flex justify-center items-center relative overflow-hidden transition-colors duration-300">
      <img
        className="w-full h-full object-cover rounded-3xl"
        src="./images/eresClub.jpg"
        alt="Imagen Pista de Padel"
      />
      <div className="bg-black/60 w-4/5 h-4/5 rounded-2xl flex flex-col justify-evenly items-center absolute p-2">
        <div className="flex flex-col justify-center items-center">
          <p className="text-white text-base sm:text-xl md:text-2xl text-center">
            ¿Eres un club?
          </p>
          <p className="text-white text-base sm:text-xl md:text-2xl text-center">
            Solicita formar parte de PadelHere
          </p>
        </div>
        <button className="text-white p-2 px-4 bg-[#006FFF] rounded-lg text-xs sm:text-base shadow hover:bg-blue-700 transition-colors">
          Solicitar
        </button>
      </div>
    </div>
  )
}

export default InicioClub