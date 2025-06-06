import { useContext, useEffect, useRef, useState } from "react";
import emailjs from 'emailjs-com'
import { useNavigate } from "react-router-dom";
import { useFormField, validateEmail } from "../../hooks/useFormHooks";
import { AuthContext } from "../../context/AuthContext";

const Recover = () => {
    const emailField = useFormField<string>("", validateEmail);
    const [name, setName] = useState("");
    const [passcode, setPasscode] = useState("");
    const navigate = useNavigate();
    const noRecoverElement = useRef<HTMLParagraphElement>(null);
    const [isClub, setIsClub] = useState(false);
    const { isLoggedIn } = useContext(AuthContext)!;

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/app', { replace: true });
        }
    }, []);

    const handleToggle = () => {
        setIsClub(!isClub);
    };

    useEffect(() => {
        if (passcode && name) {
            send_mail();
        }
    }, [passcode, name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (noRecoverElement.current) {
            if (emailField.value === "") {
                noRecoverElement.current.textContent = 'El correo electrónico es obligatorio.';
                return;
            }
            // Nueva validación: si el email no es válido, no envía la petición
            if (emailField.error) {
                noRecoverElement.current.textContent = emailField.error;
                return;
            }
            noRecoverElement.current.textContent = '';
        }
        // let error = false;
        fetch(`http://localhost:8000/v1/${isClub ? "club" : "usuario"}/recover?email=${emailField.value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(async response => {
                const data = await response.json();
                const error = !response.ok;
                // Debug: muestra los datos y el error en consola
                console.log("data:", data, "error:", error);
                return { data, error };
            })
            .then(({ data, error }) => {
                if (error) {
                    if (noRecoverElement.current) {
                        noRecoverElement.current.textContent = data.detail || "Usuario no encontrado.";
                    }
                    return;
                }
                setPasscode(data.passcode);
                setName(data.name);
            })
            .catch(error => {
                if (noRecoverElement.current) {
                    noRecoverElement.current.textContent = "Error al buscar el usuario.";
                }
                console.log(error);
            });
    };

    const send_mail = () => {
        emailjs
            .send(
                "service_pp7ga5x",
                "template_cwfukr7",
                { email: emailField.value, name, passcode },
                "xJLGPz0Rey9u3ehvb"
            )
            .then(
                () => {
                    navigate(`/sesion/verify-passcode?club=${isClub}&email=${emailField.value}`, { replace: true });
                },
                (error) => {
                    console.error("Error al enviar el correo:", error.text);
                }
            );
    }

    return (
        <div className="flex items-center justify-center min-w-full min-h-[calc(100vh-100px)] px-2 sm:px-0 transition-colors duration-300">
            <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-md transition-colors duration-300">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 dark:text-blue-300">
                    Recuperar Contraseña
                </h2>
                <form noValidate onSubmit={handleSubmit} >
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Correo Electrónico
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type="email"
                                id="email"
                                value={emailField.value}
                                onChange={(e) => {
                                    emailField.onChange(e.target.value);
                                    if (noRecoverElement.current) noRecoverElement.current.textContent = "";
                                }}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-blue-400 focus:border-indigo-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 sm:text-sm transition-colors duration-200"
                                placeholder="Ingresa tu correo"
                            />
                            <span className="p-2">
                                {emailField.error ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : emailField.value ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        <p ref={noRecoverElement} id="noRecover" className=" text-red-500 m-0 text-sm"></p>
                    </div>
                    <div className="mb-4 justify-center gap-2 flex items-center">
                        <p className="text-gray-800 dark:text-gray-200">¿Eres un Club?</p>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isClub} onChange={handleToggle} className="sr-only peer" />
                            <div className={`ring-0 rounded-full outline-none duration-300 w-6 h-6 shadow-md flex items-center justify-center relative ${isClub ? 'bg-emerald-500' : 'bg-rose-400'}`}>
                                {/* ❌ SVG - visible cuando NO está marcado */}
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-white transition-opacity duration-200 absolute ${isClub ? 'opacity-0' : 'opacity-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>

                                {/* ✔️ SVG - visible cuando SÍ está marcado */}
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-white transition-opacity duration-200 absolute ${isClub ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 dark:bg-blue-700 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    >
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Recover;