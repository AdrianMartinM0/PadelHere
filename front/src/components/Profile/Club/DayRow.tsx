import { useContext, useState } from "react";
import { getBlocks, Block, toTimeStr } from "./PistasUtils";
import SlotBlock from "./SlotBlock";
import { BadgeInfo } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";

function isPast(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slotDate = new Date(date);
  slotDate.setHours(0, 0, 0, 0);
  return slotDate < today;
}

// NUEVO: Función para saber si el bloque reservable ya ha pasado (comparando fecha y hora actual)
function isBlockInPast(date: string, from: number) {
  const now = new Date();
  const [year, month, day] = date.split("-").map(Number);
  const blockStart = new Date(year, month - 1, day, Math.floor(from / 60), from % 60, 0, 0);
  return now >= blockStart;
}

export default function DayRow({
  dayLabel, date, config, trainings, reservas, closed, onReserve
}: {
  dayLabel: string,
  date: string,
  config: any,
  trainings: any[],
  reservas: any[],
  minStart: number,
  maxEnd: number,
  closed?: boolean,
  onReserve: (date: string, from: number, to: number) => void
}) {
  const mergedCfg = { ...config, trainings, reservas };
  const blocks: Block[] = getBlocks(mergedCfg, date);
  const { userType } = useContext(AuthContext)!;

  const past = isPast(date);

  // Estado para modal de detalle de reserva
  const [reservaDetalle, setReservaDetalle] = useState<any | null>(null);

  // Busca una reserva para un bloque concreto
  function getReservaForBlock(block: Block) {
    if (!reservas) return null;
    return reservas.find(r =>
      r.day === date &&
      ((typeof r.from === "number" ? r.from : r.from) === block.from) &&
      ((typeof r.to === "number" ? r.to : r.to) === block.to)
    );
  }

  if (closed) {
    return (
      <div className="flex w-full" style={{ marginLeft: 80 }}>
        <div className="flex flex-col justify-center w-full text-right pr-3 min-w-[120px]" style={{ marginLeft: -80 }}>
          <div className="text-sm font-medium dark:text-gray-100">
            {dayLabel} <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
          </div>
        </div>
        <div className="flex w-full items-center py-2">
          <span className="text-red-500 dark:text-red-400 font-semibold">Día cerrado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full" style={{ marginLeft: 80 }}>
      <div className="flex flex-col justify-center w-full text-right pr-3 min-w-[120px]" style={{ marginLeft: -80 }}>
        <div className="text-sm font-medium flex flex-col dark:text-gray-100">
          <p>{date}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{dayLabel}</p>
        </div>
      </div>
      <div className="flex w-full">
        {blocks.map((b: Block, i: number) => {
          const reserva = getReservaForBlock(b);
          // Cambiar la lógica del bloque deshabilitado:
          // - Si el día es pasado (past)
          // - O si el bloque es reservable y su hora de inicio ya ha pasado
          const disabledBlock = past || (b.reservable && isBlockInPast(date, b.from));
          return (
            <div key={i} className="relative">
              <SlotBlock
                from={b.from}
                to={b.to}
                type={b.type}
                reservable={b.reservable}
                disabled={disabledBlock}
                onReserve={() => onReserve(date, b.from, b.to)}
                onClick={reserva ? () => setReservaDetalle(reserva) : undefined}
              />
              {/* Puedes mostrar un pequeño icono si hay reserva */}
              {reserva && userType === "club" && (
                <div
                  className="absolute top-1 right-1 bg-blue-200 dark:bg-blue-900 rounded-full px-1 py-0.5 text-xs text-yellow-900 dark:text-yellow-200 cursor-pointer"
                  onClick={() => setReservaDetalle(reserva)}
                  title="Ver datos de la reserva"
                  style={{ zIndex: 2 }}
                >
                  <BadgeInfo className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Modal de detalle de reserva */}
      {reservaDetalle && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded shadow-lg p-6 min-w-[280px]">
            <div className="mb-2">
              <span className="font-semibold dark:text-gray-100">Reserva</span>
            </div>
            <div className="mb-1 text-sm dark:text-gray-100">
              <span className="font-semibold">Nombre:</span> {reservaDetalle.name || <span className="italic text-gray-400 dark:text-gray-500">Sin nombre</span>}
            </div>
            <div className="mb-1 text-sm dark:text-gray-100">
              <span className="font-semibold">Teléfono:</span> {reservaDetalle.phone || <span className="italic text-gray-400 dark:text-gray-500">No indicado</span>}
            </div>
            <div className="mb-1 text-sm dark:text-gray-100">
              <span className="font-semibold">Horario:</span> {toTimeStr(reservaDetalle.from)} - {toTimeStr(reservaDetalle.to)}
            </div>
            <button
              className="mt-3 px-4 py-1 rounded bg-blue-600 dark:bg-blue-800 text-white"
              onClick={() => setReservaDetalle(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}