import InicioClub from "./InicioClub"
import InicioJugador from "./InicioJugador"
import InicioNoticias from "./InicioNoticias"
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext)!;

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/app", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="h-[700px] min-w-full transition-colors duration-300">
      <div className="flex flex-col w-full h-full gap-8 md:gap-4">
        <div className="flex flex-col md:flex-row w-full h-2/3 md:h-1/2 gap-4">
          <div className="h-1/2 w-full md:h-full">
            <InicioJugador />
          </div>
          <div className="h-1/2 w-full md:h-full">
            <InicioClub />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 w-full h-1/3 md:h-1/2 rounded-4xl flex justify-center items-center relative transition-colors duration-300">
          <InicioNoticias />
        </div>
      </div>
    </div>
  )
}

export default Inicio