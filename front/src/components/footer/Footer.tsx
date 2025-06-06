const Footer = () => {
  return (
    <footer className="
      bg-white dark:bg-gray-900
      py-6
      text-center text-sm
      text-gray-600 dark:text-gray-300
      shadow-inner
      transition-colors duration-300
    ">
      <div className="
        flex flex-col-reverse items-center gap-2
        sm:flex-row sm:justify-center sm:gap-32
        w-full max-w-5xl mx-auto px-4
      ">
        <p className="select-all hover:underline cursor-pointer transition-colors duration-200">
          support@padelhere.com
        </p>
        <p>
          © 2025 <span className="font-bold text-blue-700 dark:text-blue-300">PadelHere</span>. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer