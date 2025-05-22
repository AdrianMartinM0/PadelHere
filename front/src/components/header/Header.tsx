import { useContext } from "react"
import HeaderConLog from "./HeaderConLog"
import HeaderSinLog from "./HeaderSinLog"
import { AuthContext } from "../../context/AuthContext";


const Header = () => {
  const { isLoggedIn } = useContext(AuthContext)!;

  return (
    <header
      className="flex flex-row gap-8 justify-between items-center px-24 py-1 shadow-xl bg-white"
    >
      <a href="/">
        <img className="h-16 md:h-20" src="/images/PadelHere_logo.png" alt="Logo de PadelHere" />
      </a>
      {isLoggedIn ? <HeaderConLog/> : <HeaderSinLog />}
    </header>
  )
}

export default Header