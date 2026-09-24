import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toTimeStr } from "../Profile/Club/PistasUtils";
import { Building2, MapPin, CalendarDays, Clock, Phone, FlagTriangleRight } from "lucide-react";
import { apiClient } from "../../api/apiClient";

interface ClubInfo {
  name: string;
  direccion: string;
  tel: number;
}

interface Reserva {
  _id: string;
  day: string;
  from: number;
  to: number;
  pista: string;
  club: ClubInfo;
}

export type { Reserva };

function getMapsLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function getReservaEndDate(reserva: Reserva) {
  const [year, month, day] = reserva.day.split("-").map(Number);
  const hours = Math.floor(reserva.to / 60);
  const minutes = reserva.to % 60;
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

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

const SkeletonReservaList = () => (
  <div className="flex flex-col gap-6 w-full">
    <PulseReservaCard />
    <PulseReservaCard />
    <PulseReservaCard />
  </div>
);

const ReservaCard = ({
  r,
  vencida,
}: {
  r: Reserva;
  vencida: boolean;
}) => (
  <div
    className={`border rounded-2xl px-9 py-8 mb-3 max-w-4xl min-w-[320px] w-[95vw] shadow-xl mx-auto font-sans transition-shadow
      ${vencida ? "border-red-700 dark:border-red-900 bg-red-50 dark:bg-[#2a1818]" : "border-blue-600 dark:border-blue-900 bg-blue-50 dark:bg-blue-950"}`}
  >
    <div className="flex flex-col items-center mb-2">
      <div className={`flex items-center gap-2 text-2xl font-bold mb-1
        ${vencida ? "text-red-800 dark:text-red-400" : "text-blue-800 dark:text-blue-200"}`}>
        <Building2 className={`w-7 h-7 ${vencida ? "text-red-500 dark:text-red-400" : "text-blue-500 dark:text-blue-300"}`} />
        <span>{r.club?.name}</span>
      </div>
      <div className={`flex items-center gap-2 text-lg ${vencida ? "text-red-600 dark:text-red-200" : "text-blue-600 dark:text-blue-400"}`}>
        <FlagTriangleRight className={`w-5 h-5 ${vencida ? "text-red-400 dark:text-red-300" : "text-blue-400 dark:text-blue-300"}`} />
        <span>
          Pista <span className="font-semibold">{r.pista}</span>
        </span>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-x-10 gap-y-2 mt-6">
      <div className="flex flex-col space-y-2 justify-center">
        <div className={`flex items-center gap-2 text-[17px] ${vencida ? "text-red-900 dark:text-red-200" : "text-blue-900 dark:text-blue-100"}`}>
          <CalendarDays className={`w-5 h-5 ${vencida ? "text-red-400 dark:text-red-300" : "text-blue-400 dark:text-blue-300"}`} />
          <span className="font-medium">Día:</span> {r.day}
        </div>
        <div className={`flex items-center gap-2 text-[17px] ${vencida ? "text-red-900 dark:text-red-200" : "text-blue-900 dark:text-blue-100"}`}>
          <Clock className={`w-5 h-5 ${vencida ? "text-red-400 dark:text-red-300" : "text-blue-400 dark:text-blue-300"}`} />
          <span className="font-medium">Hora:</span> {toTimeStr(r.from)} - {toTimeStr(r.to)}
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <div className={`flex items-center gap-2 text-[17px] ${vencida ? "text-red-900 dark:text-red-200" : "text-blue-900 dark:text-blue-100"}`}>
          <Phone className={`w-5 h-5 ${vencida ? "text-red-400 dark:text-red-300" : "text-blue-400 dark:text-blue-300"}`} />
          <span className="font-medium">Teléfono:</span> {r.club?.tel}
        </div>
        <div className={`flex items-center gap-2 text-[17px] break-words ${vencida ? "text-red-900 dark:text-red-200" : "text-blue-900 dark:text-blue-100"}`}>
          <a
            href={getMapsLink(r.club?.direccion || "")}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver en Google Maps"
            className={`hover:${vencida ? "text-red-700 dark:text-red-400" : "text-blue-700 dark:text-blue-300"} transition-colors`}
          >
            <MapPin className={`w-5 h-5 inline ${vencida ? "text-red-400 dark:text-red-300" : "text-blue-400 dark:text-blue-300"}`} />
          </a>
          <span className="font-medium">Dirección:</span>
          <span className="break-all">{r.club?.direccion}</span>
        </div>
      </div>
    </div>
  </div>
);

const Reservas = () => {
  const { reservaIds } = useContext(AuthContext)!; // usa SOLO reservaIds del contexto
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    let cancel = false;
    setReservas([]);
    setIsFirstLoad(true);
    if (!reservaIds.length) {
      setLoading(false);
      setIsFirstLoad(false);
      return;
    }
    setLoading(true);

    // Peticiones en paralelo
    Promise.all(
      reservaIds.map(id =>
        apiClient.request<Reserva>(`/reserva/${id}`)
          .catch(() => null)
      )
    ).then(results => {
      if (!cancel) {
        setReservas(results.filter(Boolean));
        setLoading(false);
        setIsFirstLoad(false);
      }
    });

    return () => { cancel = true; };
  }, [reservaIds]); // <-- SOLO depende de reservaIds

  const now = new Date();

  const futuras = reservas
    .filter(r => getReservaEndDate(r) >= now)
    .sort((a, b) => getReservaEndDate(a).getTime() - getReservaEndDate(b).getTime());

  const pasadas = reservas
    .filter(r => getReservaEndDate(r) < now)
    .sort((a, b) => getReservaEndDate(b).getTime() - getReservaEndDate(a).getTime());

  return (
    <div className="flex flex-col items-center justify-start gap-4 min-h-screen w-full pb-10">
      <div className="w-full mt-8 mb-2 px-2">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-lg p-6 text-white w-full">
          <h1 className="text-2xl font-bold mb-2">Mis Reservas</h1>
          <p className="text-blue-100 dark:text-blue-200">Aquí puedes ver las reservas que has realizado</p>
        </div>
      </div>
      {(isFirstLoad || loading) && (
        <SkeletonReservaList />
      )}
      {!loading && !isFirstLoad && reservas.length === 0 ? (
        <div className="text-lg px-4 mt-8 text-gray-500 dark:text-gray-400">No tienes reservas.</div> 
      ) : (
        !loading && !isFirstLoad && (
          <div className="flex flex-col gap-6 w-full">
            {/* Futuras (ordenadas de más cercana a más lejana) */}
            {futuras.map(r => <ReservaCard key={r._id} r={r} vencida={false} />)}
            {/* Pasadas (ordenadas de más reciente a menos) */}
            {pasadas.length > 0 && (
              <div className="w-full flex justify-center">
                <div className="mt-8 mb-2 text-red-800 dark:text-red-400 font-semibold text-lg text-center">
                  Reservas pasadas
                </div>
              </div>
            )}
            {pasadas.map(r => <ReservaCard key={r._id} r={r} vencida={true} />)}
          </div>
        )
      )}
    </div>
  );
}
export default Reservas;