import InicioClub from "./InicioClub"
import InicioJugador from "./InicioJugador"
import InicioNoticias from "./InicioNoticias"


const Inicio = () => {
  return (
    <div className="h-full">
        <div className="flex flex-col w-full h-full gap-4">
            <div className="flex w-full h-1/2 gap-4">
                <InicioJugador/>
                <InicioClub/>
            </div>
            
            <div className="bg-white w-full h-1/2 rounded-4xl flex justify-center items-center relative">
              <InicioNoticias/>
            </div>

        </div>
    </div>
  )
}

export default Inicio