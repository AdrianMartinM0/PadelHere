import HeaderSinLog from "./HeaderSinLog"



const Header = () => {
  return (
    <header className="flex flex-row gap-8 justify-between items-center px-24 py-4 shadow-xl bg-white">
      <img className="h-16 md:h-20" src="./images/PadelHere_logo.png" alt="Logo de PadelHere" />
      <HeaderSinLog />
    </header>
  )
}

export default Header