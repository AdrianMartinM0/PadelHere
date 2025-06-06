import { Link } from "react-router-dom"

const HeaderSinLog = () => {
    return (
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-center">
            {/* Iniciar Sesión */}
            <Link to="/sesion">
                <div className="
        w-32 sm:w-36 h-10 flex justify-center items-center
        border border-blue-400 dark:border-blue-700
        rounded-full bg-white dark:bg-gray-900
        shadow-sm
        transition-all duration-200
      ">
                    <p className="
            text-blue-600 dark:text-blue-300
            font-semibold hover:text-blue-800 dark:hover:text-blue-100
            transition-colors duration-200
          ">
                        Iniciar Sesión
                    </p>
                </div>
            </Link>
            {/* Registrarse */}
            <Link to="/sesion/register">
                <div className="
        w-32 sm:w-36 h-10 flex justify-center items-center gap-2
        rounded-full
        bg-blue-600 dark:bg-blue-700
        shadow-md
        hover:bg-blue-700 dark:hover:bg-blue-800
        transition-all duration-200
      ">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
                        <path fill="#fff" d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                    </svg>
                    <p className="
            text-white font-semibold
            transition-colors duration-200
          ">
                        Registrarse
                    </p>
                </div>
            </Link>
        </div>
    )
}

export default HeaderSinLog