import ConfigPanel from "./ConfigPanel";
import Legend from "./Legend";
import TimeRuler from "./TimeRuler";
import DayRow from "./DayRow";
import { toMinutes, toTimeStr } from "./PistasUtils";
import { getNext14Days } from "./PistasUtils";
import { useState } from "react";

const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function CourtPanel({
  court, config, setConfig, reservas, onReserve
}: {
  court: { id: string; name: string; desc?: string } | undefined,
  config: any, // Debe tener estructura { days: { [day: string]: DayConfig }, overrides: { [date: string]: DayConfig }, trainings: Training[] }
  setConfig: (cfg: any) => void,
  setTrainings: (t: any[]) => void, // Puedes dejarlo si lo usas en ConfigPanel, si no, elimínalo
  reservas: any[],
  onReserve: (day: string, from: number, to: number) => void,
}) {
  if (!court) return null;

  const [weekIndex, setWeekIndex] = useState(0);

  const daysWithDates = getNext14Days();
  const weekDaysToShow = daysWithDates.slice(weekIndex * 7, (weekIndex + 1) * 7);

  // Para TimeRuler: busca el primer día no cerrado, considerando overrides primero
  let firstConfig = null;
  for (let i = 0; i < weekDaysToShow.length; i++) {
    const dateISO = weekDaysToShow[i].date;
    const jsDayIdx = new Date(dateISO).getDay();
    const dayName = weekDays[jsDayIdx];
    const dayConfig = config.overrides?.[dateISO] ?? config.days[dayName];
    if (dayConfig && !dayConfig.closed) {
      firstConfig = dayConfig;
      break;
    }
  }
  if (!firstConfig) firstConfig = config.days["Lunes"];
  const minStart = toMinutes(firstConfig.open);
  let maxEnd = toMinutes(firstConfig.close);
  if (maxEnd <= minStart) maxEnd += 24 * 60;

  return (
    <>
      <p className="mb-6 text-sm text-gray-600">{court.desc}</p>
      <ConfigPanel
        cfg={config}
        setCfg={setConfig}
      />
      <Legend />

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
            const dayConfig = config.overrides?.[date] ?? config.days[dayName];

            // Elegir entrenos: primero entrenos de override, si no hay, globales de ese día
            const trainingsForDay =
              (dayConfig.trainings && dayConfig.trainings.length > 0)
                ? dayConfig.trainings
                : (config.trainings || []).filter((tr: any) => tr.day === dayName);

            return (
              <DayRow
                key={date}
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
            );
          })}
        </div>
      </div>
    </>
  );
}