import InicioClub from "./InicioClub"
import InicioJugador from "./InicioJugador"
import InicioNoticias from "./InicioNoticias"


const Inicio = () => {
  return (
    <div className="h-full">
        <div className="flex flex-col w-full h-full gap-4">
            <div className="flex w-full h-[380px] gap-4">
                <InicioJugador/>
                <InicioClub/>
            </div>
            <div className="flex h-[380px]">
                <InicioNoticias/>
            </div>
        </div>
    </div>
  )
}

export default Inicio