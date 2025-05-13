import { useRef, useState } from "react";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    const [isPasswordVisibleP, setPasswordVisibleP] = useState(false);
    const [isPasswordVisibleC, setPasswordVisibleC] = useState(false);
    const noRegisterElement = useRef(null);

    const toggleVisibilityP = () => {
        setPasswordVisibleP((prev) => !prev);
    };

    const toggleVisibilityC = () => {
        setPasswordVisibleC((prev) => !prev);
    };

    // Validaciones adicionales
    const handleNameChange = (value: string) => {
        setName(value);
        setErrors((prev) => ({ ...prev, name: validateName(value) }));
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    };

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(value, password) }));
    };

    const handleRegister = async () => {

        // Validaciones de campos vacíos
        if(noRegisterElement.current){
            if (name === "" || email === "" || phone === "" || password === "" || confirmPassword === "") {
                noRegisterElement.current.textContent = "Por favor rellena todos los campos";
                return;
            } else {
                noRegisterElement.current.textContent = "";
            }
        }

        if (errors.name || errors.email || errors.phone || errors.password || errors.confirmPassword) return;

        try {
            const response = await fetch("http://localhost:8000/v1/usuario/register", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    tel: phone,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error("Error al registrarse.");
            }

            const data = await response.json();
            console.log("Registro exitoso:", data);
        } catch (error) {
            console.error("Error durante el registro:", error);
        }
    };

    const validateName = (value: string) => {
        if (!value) return "El nombre completo es obligatorio.";
        if (value.length < 3) return "El nombre debe tener al menos 3 caracteres.";
        return "";
    };

    const validateEmail = (value: string) => {
        if (!value) return "El correo electrónico es obligatorio.";
        if (!/\S+@\S+\.\S+/.test(value)) return "El correo electrónico no es válido.";
        return "";
    };

    const validatePhone = (value: string) => {
        if (!value) return "El número de teléfono es obligatorio.";
        if (!/^\d{9}$/.test(value)) return "El número de teléfono debe tener 9 dígitos.";
        return "";
    };

    const validatePassword = (value: string) => {
        if (!value) return "La contraseña es obligatoria.";
        if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
        if (!/[A-Z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return "Debe incluir una letra mayúscula, un número y un carácter especial.";
        }
        return "";
    };

    const validateConfirmPassword = (value: string, password: string) => {
        if (!value) return "Debes confirmar tu contraseña.";
        if (value !== password) return "Las contraseñas no coinciden.";
        return "";
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
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                                    }`}
                            />
                            <span className="p-2">
                                {errors.name ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : name ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                                    }`}
                            />
                            <span className="p-2">
                                {errors.email ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : email ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                                    }`}
                            />
                            <span className="p-2">
                                {errors.phone ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : phone ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* Contraseña */}
                    <div className="mb-4 flex flex-col items-center">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type={isPasswordVisibleP ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
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
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z"/></svg>
                                    ) : (
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>
                                    )}
                                </button>
                            </div>
                            <span className="p-2">
                                {errors.password ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : password ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
                                value={confirmPassword}
                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
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
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z"/></svg>
                                    ) : (
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>
                                    )}
                                </button>
                            </div>
                            <span className="p-2">
                                {errors.confirmPassword ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : confirmPassword ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Registrarse
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;