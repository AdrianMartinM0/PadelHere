import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFormField, validatePassword, validateConfirmPassword } from "../../hooks/useFormHooks";
import { AuthContext } from '../../context/AuthContext';

const SetNewPassword = () => {
    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');
    const passcode = new URLSearchParams(location.search).get('passcode');
    const { isLoggedIn } = useContext(AuthContext)!;


useEffect(() => {
    if (isLoggedIn) {
        navigate('/app', { replace: true });
    }
    if (!email || email === "" || !passcode || passcode === "") {
            navigate(-1);
        }
    }, []);

    const isClub = new URLSearchParams(location.search).get('club');
    const navigate = useNavigate();
    const newPasswordField = useFormField<string>("", validatePassword);
    const confirmPasswordField = useFormField(
        "",
        (v) => validateConfirmPassword(v, newPasswordField.value)
    );
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);
    const [isPasswordVisibleP, setPasswordVisibleP] = useState(false);
    const [isPasswordVisibleC, setPasswordVisibleC] = useState(false);

    const toggleVisibilityP = () => setPasswordVisibleP((prev) => !prev);
    const toggleVisibilityC = () => setPasswordVisibleC((prev) => !prev);

    // Validar ambos campos cuando cambie uno de los dos
    const handleNewPasswordChange = (value: string) => {
        newPasswordField.onChange(value);
        confirmPasswordField.setError(validateConfirmPassword(confirmPasswordField.value, value));
    };
    const handleConfirmPasswordChange = (value: string) => {
        confirmPasswordField.onChange(value);
        newPasswordField.setError(validatePassword(newPasswordField.value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !passcode || !newPasswordField.value) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (newPasswordField.error || confirmPasswordField.error) {
            setError('Corrige los errores antes de continuar');
            return;
        }

        fetch(`http://localhost:8000/v1/${isClub ? "club" : "usuario"}/changePassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                passcode: passcode,
                new_password: newPasswordField.value,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al cambiar la contraseña');
                }
                return response.json();
            })
            .then(() => {
                setSuccess(true);
            })
            .catch(() => {
                setError('Hubo un problema al cambiar la contraseña');
            });
    };

    useEffect(() => {
        if (success)
            setTimeout(() => {
                navigate("/sesion", { replace: true });
            }, 1000);
    }, [success]);


    return (
        <div className="flex items-center justify-center min-w-full px-4 sm:px-0">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    Crear Nueva Contraseña
                </h2>
                {email && (
                    <p className="mb-4 text-sm text-gray-600 text-center">
                        Cambiando contraseña para: <strong>{email}</strong>
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="newPassword"
                            className="block mb-2 text-sm font-medium text-gray-700"
                        >
                            Nueva Contraseña
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type={isPasswordVisibleP ? "text" : "password"}
                                id="newPassword"
                                value={newPasswordField.value}
                                onChange={(e) => handleNewPasswordChange(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${newPasswordField.error ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Ingresa la nueva contraseña"
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
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z" /></svg>
                                    ) : (
                                        // ...icono oculto...
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" /></svg>
                                    )}
                                </button>
                            </div>
                            <span className="p-2">
                                {newPasswordField.error ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : newPasswordField.value ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {newPasswordField.error && (
                            <p className="mt-1 text-sm text-red-500">{newPasswordField.error}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="confirmPassword"
                            className="block mb-2 text-sm font-medium text-gray-700"
                        >
                            Confirmar Contraseña
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type={isPasswordVisibleC ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPasswordField.value}
                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${confirmPasswordField.error ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Confirma la nueva contraseña"
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
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z" /></svg>
                                    ) : (
                                        // ...icono oculto...
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" /></svg>
                                    )}
                                </button>
                            </div>
                            <span className="p-2">
                                {confirmPasswordField.error ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : confirmPasswordField.value ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {confirmPasswordField.error && (
                            <p className="mt-1 text-sm text-red-500">{confirmPasswordField.error}</p>
                        )}
                    </div>
                    {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                    {success && <p className="mb-4 text-sm text-green-500">¡Contraseña actualizada con éxito!</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Guardar Contraseña
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetNewPassword;
