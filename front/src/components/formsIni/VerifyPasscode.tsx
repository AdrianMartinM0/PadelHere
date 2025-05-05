import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyPasscode = () => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Simulate passcode verification
        if (passcode === '123456') {
            navigate(`/set-new-password?email=${email}`); // Redirige con el email en la URL
        } else {
            setError('Código de verificación inválido');
        }
    };

    return (
        <div className="flex items-center justify-center absolute inset-0 bg-[#0003] px-4 sm:px-0">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    Verificar Código
                </h2>
                {email && (
                    <p className="mb-4 text-sm text-gray-600 text-center">
                        Verificando para: <strong>{email}</strong>
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="passcode"
                            className="block mb-2 text-sm font-medium text-gray-700"
                        >
                            Código de Verificación
                        </label>
                        <input
                            type="text"
                            id="passcode"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingresa el código"
                        />
                    </div>
                    {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Verificar Código
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyPasscode;