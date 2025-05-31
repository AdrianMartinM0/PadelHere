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

// Separamos la config global y la de pista
type ConfigPanelProps = {
  globalDays: { [day: string]: DayConfig };
  setGlobalDays: (days: { [day: string]: DayConfig }) => void;
  cfg: {
    overrides?: { [date: string]: DayConfig };
    trainings: (Training & { day: string })[];
  };
  setCfg: (c: { overrides?: { [date: string]: DayConfig }; trainings: (Training & { day: string })[] }) => void;
  saveGlobalOverride?: (date: string, override: DayConfig) => void; // <-- FALTABA ESTA LÍNEA
};

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function ConfigPanel({ globalDays, setGlobalDays, cfg, setCfg, saveGlobalOverride }: ConfigPanelProps) {
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

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded border">
      {/* --- Configuración GLOBAL (tabla de días) --- */}
      <h2 className="font-semibold mb-2 text-lg">Configuración de apertura por día (global para el club)</h2>
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
                  value={globalDays[day].open}
                  onChange={e => setGlobalDays({
                    ...globalDays,
                    [day]: { ...globalDays[day], open: e.target.value }
                  })}
                  disabled={globalDays[day].closed}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td>
                <input
                  type="time"
                  value={globalDays[day].close}
                  onChange={e => setGlobalDays({
                    ...globalDays,
                    [day]: { ...globalDays[day], close: e.target.value }
                  })}
                  disabled={globalDays[day].closed}
                  className="border rounded px-2 py-1"
                />
              </td>
              <td>
                <label>
                  <input
                    type="checkbox"
                    checked={globalDays[day].hasBreak}
                    onChange={e => setGlobalDays({
                      ...globalDays,
                      [day]: { ...globalDays[day], hasBreak: e.target.checked }
                    })}
                    disabled={globalDays[day].closed}
                  />{" "}
                  {globalDays[day].hasBreak && (
                    <>
                      <input
                        type="time"
                        value={globalDays[day].break.from}
                        onChange={e => setGlobalDays({
                          ...globalDays,
                          [day]: {
                            ...globalDays[day],
                            break: { ...globalDays[day].break, from: e.target.value }
                          }
                        })}
                        className="border rounded px-1 mx-1"
                        disabled={globalDays[day].closed}
                      />
                      -
                      <input
                        type="time"
                        value={globalDays[day].break.to}
                        onChange={e => setGlobalDays({
                          ...globalDays,
                          [day]: {
                            ...globalDays[day],
                            break: { ...globalDays[day].break, to: e.target.value }
                          }
                        })}
                        className="border rounded px-1 mx-1"
                        disabled={globalDays[day].closed}
                      />
                    </>
                  )}
                </label>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={globalDays[day].closed}
                  onChange={e => setGlobalDays({
                    ...globalDays,
                    [day]: { ...globalDays[day], closed: e.target.checked }
                  })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Sección de excepciones (overrides) por fecha concreta --- */}
      <hr className="my-4" />
      <div className="mb-2">
        <span className="font-semibold">Excepciones por fecha concreta (solo para esta pista):</span>
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
            <input type="checkbox" checked={overrideConfig.closed} onChange={e => setOverrideConfig({ ...overrideConfig, closed: e.target.checked })} />
            Cerrado
          </label>
        </div>
        {/* Entrenamientos para la excepción */}
        <div className="flex items-center gap-4 mt-2 pl-4 border-l">
          <span className="text-xs font-semibold whitespace-nowrap">Entrenamientos para esta fecha:</span>
          <ul className="flex gap-2 flex-wrap mb-0">
            {(overrideConfig.trainings || []).map((tr, i) => (
              <li key={i} className="flex gap-2 items-center text-xs border px-2 rounded-xl bg-gray-100 ">
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
              },
              trainings: cfg.trainings // mantener entrenamientos
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
        {overrideConfig.hasBreak || overrideConfig.closed? (
          <button
            type="button"
            className="bg-blue-600 text-white px-2 py-1 rounded mt-2 ml-2"
            onClick={() => {
              if (!overrideDate) return;
              if (saveGlobalOverride) {
                saveGlobalOverride(overrideDate, overrideConfig);
              }
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
          >
            Aplicar a todo el club (excepción global)
          </button>

        ) : null}
      </div>

      {/* Entrenaminetos fijos por dia de la semana (solo para esta pista) */}
      <div className="mb-2">
        <span className="font-semibold">Entrenamientos de esta pista:</span>
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
            <li key={i} className="flex gap-2 items-center text-xs border px-2 py-1 rounded-xl">
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