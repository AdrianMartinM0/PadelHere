import { Link } from "react-router-dom"



const HeaderSinLog = () => {
    return (
        <div className="flex flex-col flex-col-reverse sm:flex-row gap-4 items-center">
            <div className="border w-36 max-h-10 flex justify-around items-center p-2 rounded-4xl">
                <Link to={"/sesion"}><p className="text-blue-500 hover:underline">Iniciar Sesión</p></Link>      
            </div>
            <div className="bg-[#006FFF] w-36 max-h-10 flex justify-around items-center p-2 rounded-4xl">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512"><path fill="#fff" d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" /></svg>
                <Link to={"/sesion/register"}><p className="text-white hover:underline">Registrarse</p></Link>
            </div>
        </div>
    )
}

export default HeaderSinLog