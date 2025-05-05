

const InicioClub = () => {
  return (
    <div className="bg-white h-full w-full rounded-4xl flex justify-center items-center relative">
        <img className="w-full h-full object-cover rounded-4xl" src="./images/eresClub.jpg" alt="Imagen Pista de Padel" />
        <div className="bg-[#00000099] w-4/5 h-4/5 rounded-4xl flex flex-col justify-evenly items-center absolute p-2">
          <div className="flex flex-col justify-center items-center">
            <p className="text-white text-xl sm:text-3xl text-center">¿Eres un club?</p>
            <p className="text-white text-xl sm:text-3xl text-center">Solicita formar parte de PadelHere</p>
          </div>
          <button className="text-white p-2 px-4 bg-[#006FFF] rounded-lg text-sm sm:text-base">Solicitar</button>
        </div>
    </div>
  )
}

export default InicioClub