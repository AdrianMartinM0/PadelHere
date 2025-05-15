import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SetNewPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({ password: '', confirmPassword: '', general: '' });
    const [success, setSuccess] = useState(false);
    const [isPasswordVisibleP, setPasswordVisibleP] = useState(false);
    const [isPasswordVisibleC, setPasswordVisibleC] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');
    const passcode = new URLSearchParams(location.search).get('passcode');

    const toggleVisibilityP = () => setPasswordVisibleP(prev => !prev);
    const toggleVisibilityC = () => setPasswordVisibleC(prev => !prev);

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

    const handlePasswordChange = (value: string) => {
        setNewPassword(value);
        setErrors((prev) => ({
            ...prev,
            password: validatePassword(value),
            confirmPassword: validateConfirmPassword(confirmPassword, value),
        }));
    };


    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        setErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(value, newPassword),
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        if (!email || !passcode) {
            navigate('/recover');
            return;
        }

        e.preventDefault();
        setErrors({ password: '', confirmPassword: '', general: '' });
        setSuccess(false);

        const passwordError = validatePassword(newPassword);
        const confirmError = newPassword !== confirmPassword ? 'Las contraseñas no coinciden' : '';

        if (passwordError || confirmError) {
            setErrors({ password: passwordError, confirmPassword: confirmError, general: '' });
            return;
        }


        try {
            const response = await fetch('http://localhost:8000/v1/usuario/changePassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    passcode: passcode.trim(),
                    new_password: newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Error al cambiar la contraseña');
            }

            setSuccess(true);
            // setTimeout(() => {
            //     navigate('/login');
            // }, 2000);
        } catch (error: any) {
            setErrors({ ...errors, general: error.message || 'Hubo un problema al cambiar la contraseña' });
        }
    };

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
                    {/* Nueva contraseña */}
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700">
                            Nueva Contraseña
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type={isPasswordVisibleP ? "text" : "password"}
                                id="password"
                                value={newPassword}
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
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z" /></svg>
                                    ) : (
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" /></svg>
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
                                ) : newPassword ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                            Confirmar Contraseña
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
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144l0 48-16 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-240 0 0-48z" /></svg>
                                    ) : (
                                        <svg className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" /></svg>
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
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Mensajes */}
                    {errors.general && <p className="mb-4 text-sm text-red-500">{errors.general}</p>}
                    {success && (
                        <div className="fixed inset-0 flex items-center justify-center bg-[#00000060]">
                            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                <p className="mb-4 text-sm text-green-500">¡Contraseña actualizada con éxito!</p>
                                <button
                                    onClick={() => navigate('/sesion/login')}
                                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Botón */}
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
