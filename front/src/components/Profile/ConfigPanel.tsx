import { useEffect, useState } from "react";

// Types
type Training = {
  day: string;
  from: string;
  duration: number;
};

type Break = {
  from: string;
  to: string;
};

type CourtConfig = {
  open: string;
  close: string;
  hasBreak?: boolean;
  break?: Break;
  trainings: Training[];
};

// Days of the week
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function ConfigPanel({cfg, setCfg}:{cfg:CourtConfig, setCfg:(c:CourtConfig)=>void}) {
  const [newTraining, setNewTraining] = useState<Training>({day:days[0], from:"10:00", duration:60});
  const [showBreak, setShowBreak] = useState<boolean>(cfg.hasBreak ?? !!(cfg.break && cfg.break.from && cfg.break.to));
  useEffect(() => {
    setShowBreak(cfg.hasBreak ?? !!(cfg.break && cfg.break.from && cfg.break.to));
  }, [cfg.hasBreak, cfg.break]);
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded border">
      <h2 className="font-semibold mb-2 text-lg">Configuración</h2>
      <div className="flex gap-4 mb-2 flex-wrap">
        <label>Apertura
          <input type="time" value={cfg.open} onChange={e=>setCfg({...cfg, open:e.target.value})} className="ml-2 border rounded px-2 py-1"/>
        </label>
        <label>Cierre
          <input type="time" value={cfg.close} onChange={e=>setCfg({...cfg, close:e.target.value})} className="ml-2 border rounded px-2 py-1"/>
        </label>
        <button
          type="button"
          className={`px-3 py-1 rounded border font-medium ${showBreak ? "bg-yellow-100 border-yellow-400" : "bg-gray-200 border-gray-300"} ml-2`}
          onClick={()=>{
            setShowBreak((val: boolean)=>!val);
            setCfg({...cfg, hasBreak: !showBreak, break: !showBreak ? {from:"14:00",to:"16:00"} : {from:"",to:""}});
          }}
        >
          {showBreak ? "Quitar descanso" : "Configurar descanso"}
        </button>
        {showBreak && <>
          <label>Descanso desde
            <input type="time" value={cfg.break?.from||""} onChange={e=>setCfg({...cfg, break:{from: e.target.value, to: cfg.break?.to ?? ""}, hasBreak: true})} className="ml-2 border rounded px-2 py-1"/>
          </label>
          <label>hasta
            <input type="time" value={cfg.break?.to||""} onChange={e=>setCfg({...cfg, break:{from: cfg.break?.from ?? "", to: e.target.value}, hasBreak: true})} className="ml-2 border rounded px-2 py-1"/>
          </label>
        </>}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Entrenamientos:</span>
        <ul className="mb-2">
          {cfg.trainings?.map((tr: Training, i: number)=>
            <li key={i} className="flex gap-2 items-center text-xs">
              {tr.day} {tr.from} ({tr.duration} min)
              <button type="button" className="text-red-500" onClick={()=>{
                setCfg({...cfg, trainings: cfg.trainings.filter((_: Training, j: number)=>i!==j)});
              }}>✕</button>
            </li>
          )}
        </ul>
        <div className="flex gap-2 items-center">
          <select value={newTraining.day} onChange={e=>setNewTraining({...newTraining, day:e.target.value})} className="border rounded px-1">
            {days.map((d: string)=><option key={d} value={d}>{d}</option>)}
          </select>
          <input type="time" value={newTraining.from} onChange={e=>setNewTraining({...newTraining, from:e.target.value})} className="border rounded px-1"/>
          <input type="number" min={15} max={180} step={15} value={newTraining.duration} onChange={e=>setNewTraining({...newTraining, duration:+e.target.value})} className="border rounded px-1 w-16"/>
          <button type="button" className="bg-blue-600 text-white px-2 py-1 rounded" onClick={()=>{
            setCfg({...cfg, trainings: [...(cfg.trainings||[]), {...newTraining}]});
          }}>+ Añadir</button>
        </div>
        <div className="text-xs text-gray-500 mt-1">El entrenamiento puede ser cualquier duración e inicia en cualquier minuto.</div>
      </div>
    </div>
  );
}

export default ConfigPanel;