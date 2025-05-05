

const InicioNoticias = () => {
  return (
    <>
        <img
          className="w-full h-full object-cover rounded-4xl"
          src="./images/noticias.jpg"
          alt="Imagen Pista de Padel"
        />
        <div className="bg-[#00000099] w-full h-full rounded-4xl flex flex-col justify-center items-center absolute px-4 text-center absolute">
          <p className="text-white text-xl sm:text-3xl lg:text-6xl">
            Actualmente estamos en desarrollo.
          </p>
          <p className="text-white text-lg sm:text-2xl lg:text-5xl">
            Proximamente en funcionamiento.
          </p>
          <p className="text-white text-base sm:text-xl lg:text-4xl">
            Fecha estimada 15/06/2025.
          </p>
        </div>
    </>
  )
}

export default InicioNoticias