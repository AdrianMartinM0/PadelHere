import { useEffect, useState, useContext } from "react";
import { FlagTriangleRight, CalendarDays, Clock, Phone, User2 } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

// Helpers
function toTimeStr(num: number) {
    // Convierte minutos a HH:MM
    const h = Math.floor(num / 60);
    const m = num % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Tipos
type Reserva = {
    _id: string;
    day: string;
    from: number;
    to: number;
    name: string;
    phone: string;
    pista: string;
};

const PulseReservaCard = () => (
    <div
        className="border border-blue-300 dark:border-blue-900 rounded-2xl px-9 py-8 mb-3 max-w-4xl min-w-[320px] w-[95vw] 
      bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900 dark:via-blue-950 dark:to-blue-900 shadow-xl mx-auto animate-pulse min-h-[150px] flex flex-col gap-4"
        aria-label="Cargando reserva"
    >
        <div className="flex flex-col items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-200 dark:bg-blue-800 w-8 h-8" />
                <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded w-40" />
            </div>
            <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-x-10 gap-y-2 mt-2">
            <div className="flex flex-col space-y-4">
                <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded w-32" />
                <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-24" />
            </div>
            <div className="flex flex-col space-y-4">
                <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded w-48" />
                <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-36" />
            </div>
        </div>
    </div>
);

// Card adaptada sin club/dirección
const ReservaCard = ({ r }: { r: Reserva }) => (
    <div
        className="border border-blue-600 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 rounded-2xl px-9 py-8 mb-3 max-w-4xl min-w-[320px] w-[95vw] shadow-xl mx-auto font-sans transition-shadow"
    >
        <div className="flex items-center justify-around">
            <div className="flex items-center gap-2 text-2xl font-bold mb-1 text-blue-800 dark:text-blue-100">
                <User2 className="w-7 h-7 text-blue-500 dark:text-blue-300" />
                <span>{r.name}</span>
            </div>
            <div className="flex items-center gap-2 text-lg text-blue-600 dark:text-blue-300">
                <FlagTriangleRight className="w-5 h-5 text-blue-400 dark:text-blue-200" />
                <span>
                    Pista <span className="font-semibold">{r.pista}</span>
                </span>
            </div>
        </div>
        <div className="flex justify-between mt-4 flex-wrap gap-y-2">
            <div className="flex items-center gap-2 text-[17px] text-blue-900 dark:text-blue-200">
                <CalendarDays className="w-5 h-5 text-blue-400 dark:text-blue-200" />
                <span className="font-medium">Día:</span> {r.day}
            </div>
            <div className="flex items-center gap-2 text-[17px] text-blue-900 dark:text-blue-200">
                <Clock className="w-5 h-5 text-blue-400 dark:text-blue-200" />
                <span className="font-medium">Hora:</span> {toTimeStr(r.from)} - {toTimeStr(r.to)}
            </div>
            <div className="flex items-center gap-2 text-[17px] text-blue-900 dark:text-blue-200">
                <Phone className="w-5 h-5 text-blue-400 dark:text-blue-200" />
                <span className="font-medium">Teléfono:</span> {r.phone}
            </div>
        </div>
    </div>
);

const ReservasClub = () => {
    const { clubData } = useContext(AuthContext)!;
    const [reservas, setReservas] = useState<Reserva[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!clubData?.id) return;
        setLoading(true);
        fetch(`https://padelhere-production.up.railway.app/v1/reserva/pendientes/${clubData.id}`)
            .then(res => res.json())
            .then(resData => {
                // Ordenar de la más cercana a la más lejana
                const sorted = [...(resData || [])].sort((a, b) => {
                    if (a.day !== b.day) return a.day.localeCompare(b.day);
                    return a.from - b.from;
                });
                setReservas(sorted);
            })
            .finally(() => setLoading(false));
    }, [clubData?.id]);

    if (loading) {
        return (
            <PulseReservaCard />
        );
    }

    if (!reservas || reservas.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-16 text-lg">
                No hay reservas próximas.
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start gap-4 min-h-screen w-full pb-10">
            <div className="w-full mt-8 mb-4 px-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-lg p-6 text-white w-full">
                    <h1 className="text-2xl font-bold mb-2">Reservas</h1>
                    <p className="text-blue-100 dark:text-blue-200">Aquí puedes ver las reservas pendientes que tiene tu club</p>
                </div>
            </div>

            {
                reservas.map(r => (
                    <ReservaCard key={r._id} r={r} />
                ))
            }
        </div >
    );
};

export default ReservasClub;