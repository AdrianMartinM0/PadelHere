import { Trash2 } from "lucide-react";
import { useState } from "react";

// Tipos
type Training = {
  day?: string; // Opcional para el override, global sí lo lleva
  from: string;
  duration: number;
};

type Break = {
  from: string;
  to: string;
};

type DayConfig = {
  open: string;
  close: string;
  closed: boolean;
  hasBreak: boolean;
  break: Break;
  trainings?: Training[];
};

type CourtConfig = {
  days: {[day: string]: DayConfig;};
  overrides?: { [date: string]: DayConfig };
  trainings: (Training & { day: string })[];
};

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function ConfigPanel({ cfg, setCfg }: { cfg: CourtConfig, setCfg: (c: CourtConfig) => void }) {
  const [newTraining, setNewTraining] = useState<Training & { day: string }>({ day: days[0], from: "10:00", duration: 60 });

  // Estado para nueva excepción (override)
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideConfig, setOverrideConfig] = useState<DayConfig>({
    open: "08:00",
    close: "23:00",
    closed: false,
    hasBreak: false,
    break: { from: "", to: "" },
    trainings: [],
  });
  // Estado para nuevo entrenamiento en override
  const [overrideNewTraining, setOverrideNewTraining] = useState<Training>({ from: "10:00", duration: 60 });

  // Si seleccionas una excepción para editarla, cargar sus datos en el formulario:
  const handleEditOverride = (date: string, conf: DayConfig) => {
    setOverrideDate(date);
    setOverrideConfig({
      ...conf,
      trainings: conf.trainings ? [...conf.trainings] : [],
    });
  };

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded border">
      <h2 className="font-semibold mb-2 text-lg">Configuración de apertura por día</h2>
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr>
            <th>Día</th>
            <th>Abrir</th>
            <th>Cerrar</th>
            <th>Descanso</th>
            <th>Cerrado</th>
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td className="font-medium">{day}</td>
              <td>
                <input
                  type="time"
                  value={cfg.days[day].open}
                  onChange={e => setCfg({
                    ...cfg,
                    days: { ...cfg.days, [day]: { ...cfg.days[day], open: e.target.value } }
                  })}
                  disabled={cfg.days[day].closed}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td>
                <input
                  type="time"
                  value={cfg.days[day].close}
                  onChange={e => setCfg({
                    ...cfg,
                    days: { ...cfg.days, [day]: { ...cfg.days[day], close: e.target.value } }
                  })}
                  disabled={cfg.days[day].closed}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td>
                <label>
                  <input
                    type="checkbox"
                    checked={cfg.days[day].hasBreak}
                    onChange={e => setCfg({
                      ...cfg,
                      days: { ...cfg.days, [day]: { ...cfg.days[day], hasBreak: e.target.checked } }
                    })}
                    disabled={cfg.days[day].closed}
                  />{" "}
                  {cfg.days[day].hasBreak && (
                    <>
                      <input
                        type="time"
                        value={cfg.days[day].break.from}
                        onChange={e => setCfg({
                          ...cfg,
                          days: {
                            ...cfg.days,
                            [day]: {
                              ...cfg.days[day],
                              break: { ...cfg.days[day].break, from: e.target.value }
                            }
                          }
                        })}
                        className="border rounded px-1 mx-1"
                        disabled={cfg.days[day].closed}
                      />
                      -
                      <input
                        type="time"
                        value={cfg.days[day].break.to}
                        onChange={e => setCfg({
                          ...cfg,
                          days: {
                            ...cfg.days,
                            [day]: {
                              ...cfg.days[day],
                              break: { ...cfg.days[day].break, to: e.target.value }
                            }
                          }
                        })}
                        className="border rounded px-1 mx-1"
                        disabled={cfg.days[day].closed}
                      />
                    </>
                  )}
                </label>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={cfg.days[day].closed}
                  onChange={e => setCfg({
                    ...cfg,
                    days: { ...cfg.days, [day]: { ...cfg.days[day], closed: e.target.checked } }
                  })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Sección de excepciones (overrides) por fecha concreta --- */}
      <hr className="my-4"/>
      <div className="mb-2">
        <span className="font-semibold">Excepciones por fecha concreta:</span>
        <div className="flex gap-2 items-center my-2">
          <input type="date" value={overrideDate} onChange={e => setOverrideDate(e.target.value)} className="border rounded px-1" />
          <input type="time" value={overrideConfig.open} onChange={e => setOverrideConfig({ ...overrideConfig, open: e.target.value })} disabled={overrideConfig.closed} />
          <input type="time" value={overrideConfig.close} onChange={e => setOverrideConfig({ ...overrideConfig, close: e.target.value })} disabled={overrideConfig.closed} />
          <label>
            <input type="checkbox" checked={overrideConfig.hasBreak} onChange={e => setOverrideConfig({ ...overrideConfig, hasBreak: e.target.checked })} disabled={overrideConfig.closed} />
            Descanso
          </label>
          {overrideConfig.hasBreak && (
            <>
              <input type="time" value={overrideConfig.break.from} onChange={e => setOverrideConfig({ ...overrideConfig, break: { ...overrideConfig.break, from: e.target.value } })} disabled={overrideConfig.closed} />
              <input type="time" value={overrideConfig.break.to} onChange={e => setOverrideConfig({ ...overrideConfig, break: { ...overrideConfig.break, to: e.target.value } })} disabled={overrideConfig.closed} />
            </>
          )}
          <label>
            <input type="checkbox" checked={overrideConfig.closed} onChange={e => setOverrideConfig({ ...overrideConfig, closed: e.target.checked })}/>
            Cerrado
          </label>
        </div>
       {/* Entrenamientos para la excepción */}
<div className="flex items-center gap-4 mt-2 pl-4 border-l">
  <span className="text-xs font-semibold whitespace-nowrap">Entrenamientos para esta fecha:</span>
  <ul className="flex gap-2 flex-wrap mb-0">
    {(overrideConfig.trainings || []).map((tr, i) => (
      <li key={i} className="flex gap-2 items-center text-xs border px-2 rounded-xl bg-gray-100">
        {tr.from} ({tr.duration} min)
        <button type="button" className="text-red-500" onClick={() => {
          setOverrideConfig({
            ...overrideConfig,
            trainings: (overrideConfig.trainings || []).filter((_, j) => i !== j)
          });
        }}>✕</button>
      </li>
    ))}
  </ul>
  <div className="flex gap-2 items-center">
    <input type="time" value={overrideNewTraining.from} onChange={e => setOverrideNewTraining({ ...overrideNewTraining, from: e.target.value })} />
    <input type="number" min={15} max={180} step={15} value={overrideNewTraining.duration}
      onChange={e => setOverrideNewTraining({ ...overrideNewTraining, duration: +e.target.value })} className="w-16" />
    <button type="button" className="bg-blue-600 text-white px-2 py-1 rounded"
      onClick={() => {
        setOverrideConfig({
          ...overrideConfig,
          trainings: [...(overrideConfig.trainings || []), { ...overrideNewTraining }]
        });
        setOverrideNewTraining({ from: "10:00", duration: 60 });
      }}
    >+ Añadir</button>
  </div>
</div>
        <button
          onClick={() => {
            if (!overrideDate) return;
            setCfg({
              ...cfg,
              overrides: {
                ...(cfg.overrides || {}),
                [overrideDate]: { ...overrideConfig }
              }
            });
            setOverrideDate("");
            setOverrideConfig({
              open: "08:00",
              close: "23:00",
              closed: false,
              hasBreak: false,
              break: { from: "", to: "" },
              trainings: [],
            });
          }}
          className="bg-blue-600 text-white px-2 py-1 rounded mt-2"
        >Añadir / Actualizar</button>
        {/* Lista de excepciones */}
        <ul className="mb-2 flex gap-2 flex-wrap">
          {Object.entries(cfg.overrides || {}).map(([date, conf]) =>
            <li key={date} className="flex gap-3 items-center text-xs border px-2 rounded-xl">
              {date}: {conf.closed ? <span className="text-red-500">Cerrado</span> : `${conf.open} - ${conf.close}`}
              <button className="text-red-500" onClick={() => {
                const { [date]: _, ...rest } = cfg.overrides || {};
                setCfg({ ...cfg, overrides: rest });
              }}><Trash2 className="w-4" /></button>
              <button className="text-blue-600 underline" onClick={() => handleEditOverride(date, conf)}>
                Editar
              </button>
            </li>
          )}
        </ul>
      </div>

      <div className="mb-2">
        <span className="font-semibold">Entrenamientos:</span>
        <div className="flex gap-2 items-center mb-2">
          <select value={newTraining.day} onChange={e => setNewTraining({ ...newTraining, day: e.target.value })} className="border rounded px-1">
            {days.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="time" value={newTraining.from} onChange={e => setNewTraining({ ...newTraining, from: e.target.value })} className="border rounded px-1" />
          <input type="number" min={15} max={180} step={15} value={newTraining.duration} onChange={e => setNewTraining({ ...newTraining, duration: +e.target.value })} className="border rounded px-1 w-16" />
          <button type="button" className="bg-blue-600 text-white px-2 py-1 rounded" onClick={() => {
            setCfg({ ...cfg, trainings: [...(cfg.trainings || []), { ...newTraining }] });
            setNewTraining({ day: days[0], from: "10:00", duration: 60 });
          }}>+ Añadir</button>
        </div>
        <ul className="mb-2 flex gap-2 flex-wrap">
          {cfg.trainings?.map((tr: Training & { day: string }, i: number) =>
            <li key={i} className="flex gap-2 items-center text-xs">
              {tr.day} {tr.from} ({tr.duration} min)
              <button type="button" className="text-red-500" onClick={() => {
                setCfg({ ...cfg, trainings: cfg.trainings.filter((_: Training, j: number) => i !== j) });
              }}>✕</button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default ConfigPanel;