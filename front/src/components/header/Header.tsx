import { useContext } from "react"
import HeaderConLog from "./HeaderConLog"
import HeaderSinLog from "./HeaderSinLog"
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { isLoggedIn } = useContext(AuthContext)!;

  return (
    <header
      className="
        w-full
        flex items-center justify-between
        px-4 sm:px-8 md:px-12 lg:px-24
        py-2 md:py-3
        bg-white dark:bg-gray-900
        shadow-xl
        transition-colors duration-300
        sticky top-0 z-30
      "
    >
      <Link to={"/"} className="flex items-center gap-2">
        <img
          className="h-12 sm:h-16 md:h-20 transition-all duration-200"
          src="/images/PadelHere_logo.png"
          alt="Logo de PadelHere"
        />
        <span className="hidden lg:block text-blue-700 dark:text-blue-300 text-2xl font-extrabold tracking-tight">
          PadelHere
        </span>
      </Link>
      <nav>
        {isLoggedIn ? <HeaderConLog /> : <HeaderSinLog />}
      </nav>
    </header>
  )
}

export default Header