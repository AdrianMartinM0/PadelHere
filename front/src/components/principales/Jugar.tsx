

const Jugar = () => {

    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] w-full bg-white">
            <div className="w-full max-w-2xl bg-gray-100 rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Partidos Disponibles</h2>
            {/* Ejemplo de partidos, reemplaza con datos reales */}
            <ul>
                <li className="bg-white rounded-md p-4 mb-3 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="font-semibold">Padel Club Centro</span>
                    <span className="block text-gray-500 text-sm">Viernes 18:00</span>
                </div>
                <button className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
                    Unirse
                </button>
                </li>
                <li className="bg-white rounded-md p-4 mb-3 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="font-semibold">Polideportivo Norte</span>
                    <span className="block text-gray-500 text-sm">Sábado 11:00</span>
                </div>
                <button className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
                    Unirse
                </button>
                </li>
                <li className="bg-white rounded-md p-4 mb-3 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="font-semibold">Padel Arena Sur</span>
                    <span className="block text-gray-500 text-sm">Domingo 17:30</span>
                </div>
                <button className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
                    Unirse
                </button>
                </li>
            </ul>
            </div>
        </div>
    );
};

export default Jugar;
