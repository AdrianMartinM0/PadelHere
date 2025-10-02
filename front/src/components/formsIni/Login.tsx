import { useEffect, useRef, useState } from "react";
import GoogleAuth from "../OAuth2/GoogleAuth";
import { Link, useNavigate } from "react-router-dom";
import { useFormField, validateEmail, validatePassword } from "../../hooks/useFormHooks";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
    const emailField = useFormField<string>("", validateEmail);
    const passwordField = useFormField<string>("", validatePassword);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const noLoginElement = useRef<HTMLParagraphElement>(null);
    const navigate = useNavigate();
    const [isClub, setIsClub] = useState(false);

    const { login, isLoggedIn, loading } = useContext(AuthContext)!;

    useEffect(() => {
        if (isLoggedIn) {
            if (!loading)
                navigate('/app', { replace: true });
        }
    }, []);

    const handleToggle = () => {
        setIsClub(!isClub);
    };

    const toggleVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };

    const handleLogin = async () => {
        const email = emailField.value;
        const password = passwordField.value;

        if (noLoginElement.current) {
            if (!email || !password) {
                noLoginElement.current.textContent = 'Por favor rellena todos los campos';
                return;
            } else {
                noLoginElement.current.textContent = '';
            }
        }

        if (emailField.error || passwordField.error) return;

        try {
            const response = await fetch(`https://padelhere.onrender.com/v1/${isClub ? "club" : "usuario"}/login`, {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error("Login failed");

            const data = await response.json();
            if (data.token) {
                login(data.token);
                if (!loading && isLoggedIn)
                    navigate(isClub ? "/app/profile" : "/app");
            }
        } catch (error) {
            console.error("Error during login:", error);
            if (noLoginElement.current)
                noLoginElement.current.textContent = 'Usuario o contraseña no válido';
        }
    };

    return (
        <div className="flex items-center justify-center min-w-full px-2 sm:px-0 min-h-[calc(100vh-100px)] transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg sm:rounded-2xl shadow-lg w-full max-w-md mx-2 sm:mx-4 transition-colors duration-300">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">Iniciar Sesión</h2>
                <p id="noLogin" ref={noLoginElement} className="text-center text-red-500 m-0 text-sm"></p>
                <form noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                >
                    {/* EMAIL */}
                    <div className="mb-4 flex flex-col items-center">
                        <label htmlFor="email" className="w-full block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Correo Electrónico
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type="email"
                                id="email"
                                value={emailField.value}
                                onChange={(e) => emailField.onChange(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-gray-100 sm:text-sm transition-colors duration-200"
                            />
                            <span className="p-2">
                                {emailField.error ? (
                                    <ErrorIcon />
                                ) : emailField.value ? (
                                    <SuccessIcon />
                                ) : null}
                            </span>
                        </div>
                        {emailField.error && <p className="w-full text-red-500 text-sm mt-1">{emailField.error}</p>}
                    </div>

                    {/* PASSWORD */}
                    <div className="mb-6 flex flex-col items-center">
                        <label htmlFor="password" className="w-full block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Contraseña
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                id="password"
                                value={passwordField.value}
                                onChange={(e) => passwordField.onChange(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-gray-100 sm:text-sm transition-colors duration-200"
                            />
                            <div className="mt-1 relative">
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                                    onClick={toggleVisibility}
                                    aria-label="Toggle password visibility"
                                >
                                    {isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
                                </button>
                            </div>
                            <span className="p-2">
                                {passwordField.error ? (
                                    <ErrorIcon />
                                ) : passwordField.value ? (
                                    <SuccessIcon />
                                ) : null}
                            </span>
                        </div>
                        {passwordField.error && <p className="w-full text-red-500 text-sm mt-1">{passwordField.error}</p>}
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
                        className="w-full bg-indigo-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-indigo-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                {/* Otras opciones */}
                <div className="flex items-center mt-2">
                    <hr className="my-2 w-full border-gray-300 dark:border-gray-700" />
                    <p className="text-center w-full text-sm text-gray-600 dark:text-gray-300 mx-1">o continua con</p>
                    <hr className="my-2 w-full border-gray-300 dark:border-gray-700" />
                </div>
                <p className="text-center w-full text-sm text-gray-600 dark:text-gray-400">no disponible para clubs</p>
                <div className="mt-2 flex items-center justify-center w-full">
                    <GoogleAuth />
                </div>

                {/* Links de ayuda */}
                <div className="mt-6 flex flex-col gap-4">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                        ¿No tienes una cuenta?{" "}
                        <Link to={"/sesion/register"} className="text-indigo-600 dark:text-blue-400 hover:text-indigo-500 dark:hover:text-blue-200 font-semibold">
                            Regístrate
                        </Link>
                    </p>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                        ¿Olvidaste tu contraseña?{" "}
                        <Link to={"/sesion/recover"} className="text-indigo-600 dark:text-blue-400 hover:text-indigo-500 dark:hover:text-blue-200 font-semibold">
                            Recuperar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Iconos reutilizables
const ErrorIcon = () => (
    <span className="text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </span>
);

const SuccessIcon = () => (
    <span className="text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
    </span>
);

const EyeIcon = () => (
    <svg className="w-4 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z" /></svg>
);

const EyeOffIcon = () => (
    <svg className="w-4 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" /></svg>
);

export default Login;
