import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Jugar = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/sesion/login');
            return;
        }
        fetch("http://localhost:8000/v1/usuario/verify-jwt", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Token inválido");
                }
                console.log("Token válido");
            })
            .catch(() => {
                localStorage.removeItem("jwtToken");
                console.log("Token inválido, redirigiendo a login");
                // navigate('/');
            });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#ACD3FF]">
            <h2>HOLAAAAAA</h2>
        </div>
    );
};

export default Jugar;
