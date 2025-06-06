const InicioNoticias = () => {
  return (
    <>
      <img
        className="w-full h-full object-cover rounded-3xl"
        src="./images/noticias.jpg"
        alt="Imagen Pista de Padel"
      />
      <div className="bg-black/60 w-full h-full rounded-3xl flex flex-col justify-center items-center absolute top-0 left-0 px-2 sm:px-4 text-center">
        <p className="text-white text-base sm:text-2xl lg:text-4xl font-semibold drop-shadow">
          Actualmente estamos en desarrollo.
        </p>
        <p className="text-white text-xs sm:text-xl lg:text-2xl mt-2">
          Próximamente en funcionamiento.
        </p>
        <p className="text-white text-xs sm:text-lg lg:text-xl mt-2">
          Fecha estimada <span className="font-bold">15/06/2025</span>.
        </p>
      </div>
    </>
  )
}

export default InicioNoticias