import { useRef, useState } from "react";
import GoogleAuth from "../GoogleAuth";
import { useNavigate } from "react-router-dom";
import { useFormField, validateEmail, validatePassword } from "../../hooks/useFormHooks";

const Login = () => {
    const emailField = useFormField<string>("", validateEmail);
    const passwordField = useFormField<string>("", validatePassword);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const noLoginElement = useRef(null);
    const navigate = useNavigate();

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
            const response = await fetch("http://localhost:8000/v1/usuario/login", {
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
                localStorage.setItem("jwtToken", data.token);
                navigate("/jugar");
            }
        } catch (error) {
            console.error("Error during login:", error);
            if (noLoginElement.current)
                noLoginElement.current.textContent = 'Usuario o contraseña no válido';
        }
    };

    return (
        <div className="flex items-center justify-center min-w-full px-4 sm:px-0">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
                <p id="noLogin" ref={noLoginElement} className="text-center text-red-500 m-0 text-sm"></p>
                <form noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                >
                    {/* EMAIL */}
                    <div className="mb-4 flex flex-col items-center">
                        <label htmlFor="email" className="w-full block text-sm font-medium text-gray-700">
                            Correo Electrónico
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type="email"
                                id="email"
                                value={emailField.value}
                                onChange={(e) => emailField.onChange(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        <label htmlFor="password" className="w-full block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                id="password"
                                value={passwordField.value}
                                onChange={(e) => passwordField.onChange(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <div className="mt-1 relative">
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
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

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                {/* Otras opciones */}
                <div className="mt-6 flex flex-col gap-4">
                    <GoogleAuth />
                    <button className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-md shadow hover:bg-gray-200">
                        <img src="/apple-icon.svg" alt="Apple" className="w-5 h-5 mr-2" />
                        Continuar con AppleID
                    </button>
                </div>

                {/* Links de ayuda */}
                <div className="mt-6 flex flex-col gap-4">
                    <p className="text-center text-sm text-gray-600">
                        ¿No tienes una cuenta?{" "}
                        <a href="/sesion/register" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                            Regístrate
                        </a>
                    </p>
                    <p className="text-center text-sm text-gray-600">
                        ¿Olvidaste tu contraseña?{" "}
                        <a href="/sesion/recover" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                            Recuperar
                        </a>
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
    <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z" /></svg>
);

const EyeOffIcon = () => (
    <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" /></svg>
);

export default Login;
