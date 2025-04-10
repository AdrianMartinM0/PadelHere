import HeaderSinLog from "./HeaderSinLog"



const Header = () => {
  return (
    <header className="flex justify-between px-24 shadow-xl bg-white">
        <img className="h-24" src="./images/PadelHere_logo.png" alt="Logo de PadelHere" />
        <HeaderSinLog/>
    </header>
  )
}

export default Header