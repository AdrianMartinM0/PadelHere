import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useFormField,
    validateName,
    validateEmail,
    validatePhone,
    validatePassword,
    validateConfirmPassword
} from "../../hooks/useFormHooks";

const Register = () => {
    const nameField = useFormField<string>("", validateName);
    const emailField = useFormField<string>("", validateEmail);
    const phoneField = useFormField<string>("", validatePhone);
    const passwordField = useFormField<string>("", validatePassword);
    const confirmPasswordField = useFormField<string>(
        "",
        (v) => validateConfirmPassword(v, passwordField.value)
    );
    const noRegisterElement = useRef(null);
    const navigate = useNavigate();
    const [isPasswordVisibleP, setPasswordVisibleP] = useState(false);
    const [isPasswordVisibleC, setPasswordVisibleC] = useState(false);

    const toggleVisibilityP = () => setPasswordVisibleP((prev) => !prev);
    const toggleVisibilityC = () => setPasswordVisibleC((prev) => !prev);

    // Nueva función para manejar el cambio de password y validar ambos campos
    const handlePasswordChange = (value: string) => {
        passwordField.onChange(value);
        // Revalida confirmPassword con el nuevo valor de password
        confirmPasswordField.setError(validateConfirmPassword(confirmPasswordField.value, value));
    };

    // Nueva función para manejar el cambio de confirmPassword y validar ambos campos
    const handleConfirmPasswordChange = (value: string) => {
        confirmPasswordField.onChange(value);
        // Revalida password (por si acaso, aunque normalmente solo confirmPassword depende de password)
        passwordField.setError(validatePassword(passwordField.value));
    };

    const handleRegister = async () => {
        // Validaciones de campos vacíos
        if (noRegisterElement.current) {
            if (
                !nameField.value ||
                !emailField.value ||
                !phoneField.value ||
                !passwordField.value ||
                !confirmPasswordField.value
            ) {
                noRegisterElement.current.textContent = "Por favor rellena todos los campos";
                return;
            } else {
                noRegisterElement.current.textContent = "";
            }
        }

        if (
            nameField.error ||
            emailField.error ||
            phoneField.error ||
            passwordField.error ||
            confirmPasswordField.error
        )
            return;

        try {
            const response = await fetch("http://localhost:8000/v1/usuario/register", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: nameField.value,
                    email: emailField.value,
                    tel: phoneField.value,
                    password: passwordField.value,
                }),
            });

            if (!response.ok) {
                throw new Error("Error al registrarse.");
            }

            const data = await response.json();
            if (data.token) {
                localStorage.setItem("jwtToken", data.token);
                navigate("/jugar");
            }
        } catch (error) {
            console.error("Error durante el registro:", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-w-full px-4 sm:px-0">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Registrarse</h2>
                <p id="noRegister" ref={noRegisterElement} className="text-center text-red-500 m-0 text-sm"></p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleRegister();
                    }}
                >
                    {/* Nombre */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nombre Completo
                        </label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                id="name"
                                value={nameField.value}
                                onChange={(e) => nameField.onChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${nameField.error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                                    }`}
                            />
                            <span className="p-2">
                                {nameField.error ? (
                                    <span className="text-red-500">
                                        {/* ...icono error... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : nameField.value ? (
                                    <span className="text-green-500">
                                        {/* ...icono ok... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {nameField.error && <p className="text-red-500 text-sm mt-1">{nameField.error}</p>}
                    </div>

                    {/* Correo Electrónico */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Correo Electrónico
                        </label>
                        <div className="flex items-center">
                            <input
                                type="email"
                                id="email"
                                value={emailField.value}
                                onChange={(e) => emailField.onChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${emailField.error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                                    }`}
                            />
                            <span className="p-2">
                                {emailField.error ? (
                                    <span className="text-red-500">
                                        {/* ...icono error... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : emailField.value ? (
                                    <span className="text-green-500">
                                        {/* ...icono ok... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {emailField.error && <p className="text-red-500 text-sm mt-1">{emailField.error}</p>}
                    </div>

                    {/* Teléfono */}
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Número de Teléfono
                        </label>
                        <div className="flex items-center">
                            <input
                                type="tel"
                                id="phone"
                                value={phoneField.value}
                                onChange={(e) => phoneField.onChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${phoneField.error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                                    }`}
                            />
                            <span className="p-2">
                                {phoneField.error ? (
                                    <span className="text-red-500">
                                        {/* ...icono error... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : phoneField.value ? (
                                    <span className="text-green-500">
                                        {/* ...icono ok... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {phoneField.error && <p className="text-red-500 text-sm mt-1">{phoneField.error}</p>}
                    </div>

                    {/* Contraseña */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type={isPasswordVisibleP ? "text" : "password"}
                                id="password"
                                value={passwordField.value}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${passwordField.error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                                    }`}
                            />
                            <div className="mt-1 relative">
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={toggleVisibilityP}
                                    aria-label="Toggle password visibility"
                                >
                                    {isPasswordVisibleP ? (
                                        // ...icono visible...
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z"/></svg>
                                    ) : (
                                        // ...icono oculto...
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>
                                    )}
                                </button>
                            </div>
                            <span className="p-2">
                                {passwordField.error ? (
                                    <span className="text-red-500">
                                        {/* ...icono error... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : passwordField.value ? (
                                    <span className="text-green-500">
                                        {/* ...icono ok... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {passwordField.error && <p className="text-red-500 text-sm mt-1">{passwordField.error}</p>}
                    </div>

                    {/* Confirmar Contraseña */}
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Repetir Contraseña
                        </label>
                        <div className="flex items-center">
                            <input
                                type={isPasswordVisibleC ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPasswordField.value}
                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${confirmPasswordField.error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                                    }`}
                            />
                            <div className="mt-1 relative">
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={toggleVisibilityC}
                                    aria-label="Toggle password visibility"
                                >
                                    {isPasswordVisibleC ? (
                                        // ...icono visible...
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z"/></svg>
                                    ) : (
                                        // ...icono oculto...
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>
                                    )}
                                </button>
                            </div>
                            <span className="p-2">
                                {confirmPasswordField.error ? (
                                    <span className="text-red-500">
                                        {/* ...icono error... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : confirmPasswordField.value ? (
                                    <span className="text-green-500">
                                        {/* ...icono ok... */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {confirmPasswordField.error && <p className="text-red-500 text-sm mt-1">{confirmPasswordField.error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Registrarse
                    </button>
                </form>
                <div className="mt-6 flex flex-col gap-4">
                    <p className="text-center text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{" "}
                        <a href="/sesion" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                            Iniciar Sesión
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;