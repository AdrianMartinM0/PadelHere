import ConfigPanel from "./ConfigPanel";
import Legend from "./Legend";
import TimeRuler from "./TimeRuler";
import DayRow from "./DayRow";
import { toMinutes, toTimeStr } from "./PistasUtils";
import { getNext14Days } from "./PistasUtils";
import { useContext, useState } from "react";
import { Trash2 } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";

const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

type DayConfig = {
  open: string;
  close: string;
  closed: boolean;
  hasBreak: boolean;
  break: { from: string; to: string };
  trainings?: { from: string; duration: number }[];
};

type Training = {
  day: string;
  from: string;
  duration: number;
};

type CourtConfig = {
  overrides?: { [date: string]: DayConfig };
  trainings: Training[];
  pistaPricePerPerson?: number;
  pricePerPerson?: number; // Añadido para soportar ambos nombres
};

export default function CourtPanel({
  court,
  globalDays,
  setGlobalDays,
  config,
  setConfig,
  reservas,
  onReserve,
  globalOverrides,
  saveGlobalOverride,
  deleteGlobalOverride,
}: {
  court: { id: string; name: string; desc?: string } | undefined,
  globalDays: { [day: string]: DayConfig },
  setGlobalDays: (days: { [day: string]: DayConfig }) => void,
  config: CourtConfig,
  setConfig: (cfg: CourtConfig) => void,
  reservas: any[],
  onReserve: (day: string, from: number, to: number) => void,
  globalOverrides?: { [date: string]: DayConfig },
  saveGlobalOverride?: (date: string, override: DayConfig) => void,
  deleteGlobalOverride?: (date: string) => void,
}) {
  if (!court) return null;

  const [weekIndex, setWeekIndex] = useState(0);

  const daysWithDates = getNext14Days();
  const weekDaysToShow = daysWithDates.slice(weekIndex * 7, (weekIndex + 1) * 7);

  // Para el modal de edición del override global
  const [overrideEdit, setOverrideEdit] = useState<{
    show: boolean;
    date: string;
    dayConfig?: DayConfig;
  }>({ show: false, date: "" });

  // Busca el primer día no cerrado, prioridad: override global > override pista > globalDays
  let firstConfig: DayConfig | null = null;
  for (let i = 0; i < weekDaysToShow.length; i++) {
    const dateISO = weekDaysToShow[i].date;
    const jsDayIdx = new Date(dateISO).getDay();
    const dayName = weekDays[jsDayIdx];
    const dayConfig =
      globalOverrides?.[dateISO] ??
      config.overrides?.[dateISO] ??
      globalDays[dayName];
    if (dayConfig && !dayConfig.closed) {
      firstConfig = dayConfig;
      break;
    }
  }
  if (!firstConfig) firstConfig = globalDays["Lunes"];
  const minStart = toMinutes(firstConfig.open);
  let maxEnd = toMinutes(firstConfig.close);
  if (maxEnd <= minStart) maxEnd += 24 * 60;

  // Handler para guardar override global
  function handleSaveGlobalOverride(date: string, override: DayConfig) {
    if (saveGlobalOverride) saveGlobalOverride(date, override);
    setOverrideEdit({ show: false, date: "" });
  }

  // Overrides de pista y globales
  const allOverrides: { [date: string]: { conf: DayConfig; type: "pista" | "global" } } = {
    ...(globalOverrides
      ? Object.fromEntries(
        Object.entries(globalOverrides).map(([date, conf]) => [date, { conf, type: "global" as const }])
      )
      : {}),
    ...(config.overrides
      ? Object.fromEntries(
        Object.entries(config.overrides).map(([date, conf]) => [date, { conf, type: "pista" as const }])
      )
      : {}),
  };
  const { userType } = useContext(AuthContext)!;

  // ----------- MOSTRAR PRECIO POR PERSONA PARA EL USUARIO (Fuera de ConfigPanel) -----------
  // Ahora soporta ambos nombres de campo
  const pistaPrice = config.pricePerPerson ?? config.pistaPricePerPerson;
  // -----------------------------------------------------------------------------------------

  return (
    <>
      <p className="mb-6 text-sm text-gray-600">{court.desc}</p>

      {/* Mostrar precio SOLO si está definido y fuera del panel de configuración */}
      <div className="mb-6">
        <span className="inline-block px-4 py-2 rounded bg-blue-50 border border-blue-300 text-blue-700 font-semibold">
          Precio por persona:{" "}
          <span className="font-bold">
            {typeof pistaPrice === "number" && !isNaN(pistaPrice)
              ? `${pistaPrice}€`
              : "Por definir"}
          </span>
        </span>
      </div>

      {userType === "club" && (
        <ConfigPanel
          globalDays={globalDays}
          setGlobalDays={setGlobalDays}
          cfg={config}
          setCfg={setConfig}
          saveGlobalOverride={saveGlobalOverride}
        />)}
      <Legend />

      {/* Lista de excepciones combinando globales y pista */}
      {userType === "club" && (
        <div className="mb-6">
          <span className="font-semibold">Excepciones activas por fecha (verde = global, azul = solo esta pista):</span>
          <ul className="mb-2 flex gap-2 mt-2 flex-wrap">
            {Object.entries(allOverrides)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, { conf, type }]) =>
                <li key={date} className={`flex gap-3 items-center text-xs border px-2 rounded-xl ${type === "global" ? "border-green-400 bg-green-50" : "border-blue-400 bg-blue-50"}`}>
                  {date}: {conf.closed ? <span className="text-red-500">Cerrado</span> : `${conf.open} - ${conf.close}`}
                  <span className={type === "global" ? "text-green-600 font-bold" : "text-blue-600 font-bold"}>{type === "global" ? "Global" : "Pista"}</span>
                  {type === "pista" && (
                    <>
                      <button className="text-red-500" onClick={() => {
                        const { [date]: _, ...rest } = config.overrides || {};
                        setConfig({ ...config, overrides: rest, trainings: config.trainings });
                      }} title="Eliminar excepción de pista"><Trash2 className="w-4" /></button>
                      {/* Botón editar excepción de pista*/}
                    </>
                  )}
                  {type === "global" && deleteGlobalOverride && (
                    <button className="text-red-500" onClick={() => deleteGlobalOverride(date)} title="Eliminar excepción global"><Trash2 className="w-4" /></button>
                  )}
                </li>
              )}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mb-2 px-2">
        <button
          className="text-lg px-2 py-1 rounded border bg-gray-100 disabled:opacity-40"
          onClick={() => setWeekIndex(w => Math.max(0, w - 1))}
          disabled={weekIndex === 0}
        >← Semana actual</button>
        <span className="font-medium text-blue-700">
          {weekIndex === 0 ? "Semana actual" : "Semana siguiente"}
        </span>
        <button
          className="text-lg px-2 py-1 rounded border bg-gray-100 disabled:opacity-40"
          onClick={() => setWeekIndex(w => Math.min(1, w + 1))}
          disabled={weekIndex === 1}
        >Semana siguiente →</button>
      </div>

      <div className="bg-white rounded shadow border p-4 overflow-x-auto">
        <TimeRuler from={firstConfig.open} to={toTimeStr(maxEnd)} />
        <div className="space-y-2">
          {weekDaysToShow.map(({ label, date }) => {
            const jsDayIdx = new Date(date).getDay();
            const dayName = weekDays[jsDayIdx];
            const dayConfig: DayConfig =
              globalOverrides?.[date] ??
              config.overrides?.[date] ??
              globalDays[dayName];

            const trainingsForDay =
              (dayConfig.trainings && dayConfig.trainings.length > 0)
                ? dayConfig.trainings
                : (config.trainings || []).filter((tr: Training) => tr.day === dayName);

            return (
              <div key={date} className="relative">
                <DayRow
                  dayLabel={label}
                  date={date}
                  config={dayConfig}
                  trainings={trainingsForDay}
                  reservas={reservas}
                  minStart={toMinutes(dayConfig.open)}
                  maxEnd={toMinutes(dayConfig.close)}
                  closed={dayConfig.closed}
                  onReserve={onReserve}
                />
              </div>
            );
          })}
        </div>
      </div>

      {overrideEdit.show && (
        <OverrideGlobalModal
          date={overrideEdit.date}
          initialConfig={overrideEdit.dayConfig}
          onSave={handleSaveGlobalOverride}
          onClose={() => setOverrideEdit({ show: false, date: "" })}
        />
      )}
    </>
  );
}

function OverrideGlobalModal({
  date,
  initialConfig,
  onSave,
  onClose,
}: {
  date: string;
  initialConfig?: DayConfig;
  onSave: (date: string, config: DayConfig) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DayConfig>(
    initialConfig || {
      open: "08:00",
      close: "23:00",
      closed: false,
      hasBreak: false,
      break: { from: "", to: "" },
    }
  );
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded shadow max-w-[380px] w-full">
        <h2 className="text-lg font-semibold mb-2">
          {initialConfig ? "Editar excepción global" : "Crear excepción global"}
        </h2>
        <div className="mb-2 text-sm text-gray-700">Fecha: {date}</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(date, form);
          }}
        >
          <div className="mb-2">
            <label className="block mb-1">¿Cerrado?</label>
            <input
              type="checkbox"
              checked={form.closed}
              onChange={e => setForm(f => ({ ...f, closed: e.target.checked }))}
            />
          </div>
          {!form.closed && (
            <>
              <div className="mb-2">
                <label className="block mb-1">Hora apertura</label>
                <input
                  type="time"
                  value={form.open}
                  onChange={e => setForm(f => ({ ...f, open: e.target.value }))}
                  className="border px-2 py-1 rounded"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">Hora cierre</label>
                <input
                  type="time"
                  value={form.close}
                  onChange={e => setForm(f => ({ ...f, close: e.target.value }))}
                  className="border px-2 py-1 rounded"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">¿Tiene descanso?</label>
                <input
                  type="checkbox"
                  checked={form.hasBreak}
                  onChange={e => setForm(f => ({ ...f, hasBreak: e.target.checked }))}
                />
              </div>
              {form.hasBreak && (
                <div className="flex gap-2 mb-2">
                  <div>
                    <label className="block mb-1">Descanso de</label>
                    <input
                      type="time"
                      value={form.break.from}
                      onChange={e => setForm(f => ({ ...f, break: { ...f.break, from: e.target.value } }))}
                      className="border px-2 py-1 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">a</label>
                    <input
                      type="time"
                      value={form.break.to}
                      onChange={e => setForm(f => ({ ...f, break: { ...f.break, to: e.target.value } }))}
                      className="border px-2 py-1 rounded"
                    />
                  </div>
                </div>
              )}
            </>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded border bg-gray-100 border-gray-300"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded border bg-blue-600 border-blue-700 text-white font-bold"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}