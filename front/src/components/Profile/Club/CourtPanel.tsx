import ConfigPanel from "./ConfigPanel";
import Legend from "./Legend";
import TimeRuler from "./TimeRuler";
import DayRow from "./DayRow";
import { toMinutes, toTimeStr } from "./PistasUtils";

const days = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

export default function CourtPanel({
  court, config, setConfig, trainings, setTrainings, reservas, onReserve
}:{
  court: { id: string; name: string; desc?: string } | undefined,
  config: any,
  setConfig: (cfg: any) => void,
  trainings: any[],
  setTrainings: (t: any[]) => void,
  reservas: any[],
  onReserve: (day: string, from: number, to: number) => void,
}) {
  if (!court) return null;
  const minStart = toMinutes(config.open);
  let maxEnd = toMinutes(config.close);
  if (maxEnd <= minStart) maxEnd += 24*60;

  return (
    <>
      <p className="mb-6 text-sm text-gray-600">{court.desc}</p>
      <ConfigPanel
        cfg={{ ...config, trainings }}
        setCfg={upd => {
          setConfig((c: typeof config) => ({
            ...c,
            open: upd.open,
            close: upd.close,
            hasBreak: upd.hasBreak ?? false,
            break: upd.break ?? { from: "", to: "" }
          }));
          setTrainings(upd.trainings);
        }}
      />
      <Legend />
      <div className="bg-white rounded shadow border p-4 overflow-x-auto">
        <TimeRuler from={config.open} to={toTimeStr(maxEnd)} />
        <div className="space-y-2">
          {days.map(day => (
            <DayRow
              key={day}
              day={day}
              config={config}
              trainings={trainings}
              reservas={reservas}
              minStart={minStart}
              maxEnd={maxEnd}
              onReserve={onReserve}
            />
          ))}
        </div>
      </div>
    </>
  );
}