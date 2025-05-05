import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const SetNewPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Simulate password update
        setSuccess(true);
    };

    return (
        <div className="flex items-center justify-center absolute inset-0 bg-[#0003] px-4 sm:px-0">
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
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingresa la nueva contraseña"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="confirmPassword"
                            className="block mb-2 text-sm font-medium text-gray-700"
                        >
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirma la nueva contraseña"
                        />
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
