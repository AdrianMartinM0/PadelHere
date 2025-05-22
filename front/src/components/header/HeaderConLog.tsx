import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

// Añade la prop showLogout
const HeaderConLog = () => {
    const { logout } = useContext(AuthContext)!;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex gap-4 items-center">
            <a href="/app/jugar"><button className="py-2 hover:text-blue-400 transition">Jugar</button></a>
            <a href="/app/partidos"><button className="py-2 hover:text-blue-400 transition">Mis Partidos</button></a>
            <div className="flex justify-center items-center gap-4" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>

                <section className="flex justify-center items-center">
                    <a href="/app/profile" className="group flex justify-center p-2 rounded-md drop-shadow-xl bg-blue-500 hover:bg-white hover:border-blue-500 border border-2 from-gray-800 to-black text-white font-semibold hover:rounded-[50%] transition-all duration-500 hover:from-[#331029] hover:to-[#310413]">
                        <svg className="w-4 group-hover:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" /></svg>
                        <span className="pointer-events-none absolute opacity-0 group-hover:opacity-100 group-hover:text-gray-700 group-hover:text-sm group-hover:-translate-y-7 duration-700">
                            Perfil
                        </span>
                    </a>
                </section>
                <section className={`flex justify-center items-center transition-all duration-750 ${isHovered ? "opacity-100" : "opacity-0"} ${isHovered ? "translate-x-0" : "-translate-x-13"}  ${isHovered ? "rotate-x-0" : "-rotate-x-360"}`}>
                    <a href="/" onClick={logout} className="group flex justify-center p-2 rounded-md drop-shadow-xl bg-red-500 hover:bg-white hover:border-red-500 border border-2 from-gray-800 to-black text-white font-semibold hover:rounded-[50%] transition-all duration-500 hover:from-[#331029] hover:to-[#310413]">
                        <svg className="w-4 group-hover:text-red-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" /></svg>
                        <span className="pointer-events-none absolute opacity-0 group-hover:opacity-100 group-hover:text-gray-700 group-hover:text-sm group-hover:-translate-y-7 duration-700">
                            Salir
                        </span>
                    </a>
                </section>

            </div>
        </div>
    )
}

export default HeaderConLog