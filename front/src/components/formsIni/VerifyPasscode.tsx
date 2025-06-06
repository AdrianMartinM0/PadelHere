import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormField } from "../../hooks/useFormHooks";
import { AuthContext } from '../../context/AuthContext';

const VerifyPasscode = () => {
    // Valida que el passcode tenga exactamente 6 dígitos numéricos
    const passcodeField = useFormField("", (v: string) => {
        if (!v) return "Por favor, ingresa el código de verificación";
        if (!/^\d{6}$/.test(v)) return "El código debe tener 6 dígitos numéricos";
        return "";
    });
    const [passcodeVerify, setPasscodeVerify] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');
    const isClub = new URLSearchParams(location.search).get('club');
    const { isLoggedIn } = useContext(AuthContext)!;


    useEffect(() => {
        if (isLoggedIn) {
            navigate('/app', { replace: true });
        }
        if (!email) {
            navigate(-1);
            return;
        }
        if (email) {
            fetch(`http://localhost:8000/v1/${isClub == 'true' ? "club" : "usuario"}/passcode?email=${email}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Error al obtener el código de verificación');
                    }
                    return response.json();
                })
                .then((data) => {
                    setPasscodeVerify(data.passcode);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (passcodeField.error) {
            setError(passcodeField.error);
            return;
        }

        if (passcodeField.value === passcodeVerify) {
            navigate(`/sesion/set-new-password?club=${isClub}&email=${email}&passcode=${passcodeField.value}`, { replace: true });
        } else {
            setError('Código de verificación inválido');
        }
    };

    return (
        <div className="flex items-center justify-center min-w-full min-h-[calc(100vh-100px)] px-2 sm:px-0 transition-colors duration-300">
            <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-md transition-colors duration-300">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 dark:text-blue-300">
                    Verificar Código
                </h2>
                {email && (
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                        Verificando para: <strong>{email}</strong>
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="passcode"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Código de Verificación
                        </label>
                        <div className="flex items-center w-full">
                            <input
                                type="text"
                                id="passcode"
                                value={passcodeField.value}
                                onChange={(e) => {
                                    // Solo permite escribir hasta 6 caracteres numéricos
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    passcodeField.onChange(val);
                                    setError('');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                                placeholder="Ingresa el código"
                                maxLength={6}
                            />
                            <span className="p-2">
                                {passcodeField.error ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : passcodeField.value ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                    </div>
                    {(error || passcodeField.error) && (
                        <p className="mb-4 text-sm text-red-500">{error || passcodeField.error}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 dark:bg-blue-700 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    >
                        Verificar Código
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyPasscode;