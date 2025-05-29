import { useState } from "react";
import CourtSelector from "./CourtSelector";
import CourtPanel from "./CourtPanel";
import ReserveModal from "./ReserveModal";

const defaultCourts = [
  { id: "c1", name: "Pista 1", desc: "Cristal cubierta" },
  { id: "c2", name: "Pista 2", desc: "Panorámica exterior" },
];

type Training = { day: string, from: string, duration: number };
type Reserva = { day: string, from: number, to: number, name: string, phone: string };

export default function Pistas() {
  const [courts, setCourts] = useState(defaultCourts);
  const [selectedCourt, setSelectedCourt] = useState(courts[0].id);
  const [globalConfig, setGlobalConfig] = useState({
    open:"08:00", close:"23:00", hasBreak:true, break:{from:"14:00",to:"16:00"}
  });
  const [courtConfigs, setCourtConfigs] = useState<{[courtId:string]: {trainings: Training[], reservas: Reserva[]}}>({
    c1: { trainings: [], reservas: [] },
    c2: { trainings: [], reservas: [] }
  });

  // Para reservas
  const [modal, setModal] = useState<{show:boolean,day:string,from:number,to:number}>({show:false,day:"",from:0,to:0});

  function handleReserve(day: string, from: number, to: number) {
    setModal({show:true, day, from, to});
  }
  function confirmReserve(name:string,phone:string) {
    setCourtConfigs(prev => {
      const prevCfg = prev[selectedCourt];
      const nuevasReservas = [...(prevCfg.reservas || []), { day: modal.day, from: modal.from, to: modal.to, name, phone }];
      return {
        ...prev,
        [selectedCourt]: { ...prevCfg, reservas: nuevasReservas }
      };
    });
    setModal({show:false, day:"", from:0, to:0});
  }

  // Añadir pista
  function addCourt(name: string) {
    const newId = `c${courts.length + 1}`;
    setCourts(prev => [...prev, { id: newId, name, desc: "Nueva pista" }]);
    setCourtConfigs(prev => ({ ...prev, [newId]: { trainings: [], reservas: [] } }));
    setSelectedCourt(newId);
  }

  return (
    <div className="container mx-auto pr-6">
      <h1 className="text-2xl font-bold mb-2">Gestión de Pistas</h1>
      <CourtSelector
        courts={courts}
        selectedCourt={selectedCourt}
        setSelectedCourt={setSelectedCourt}
        addCourt={addCourt}
      />
      <CourtPanel
        court={courts.find(c => c.id === selectedCourt)}
        config={globalConfig}
        setConfig={setGlobalConfig}
        trainings={courtConfigs[selectedCourt]?.trainings ?? []}
        setTrainings={trainings =>
          setCourtConfigs(prev => ({
            ...prev,
            [selectedCourt]: { ...prev[selectedCourt], trainings }
          }))
        }
        reservas={courtConfigs[selectedCourt]?.reservas ?? []}
        onReserve={handleReserve}
      />
      <ReserveModal
        show={modal.show}
        day={modal.day}
        from={modal.from}
        to={modal.to}
        onClose={()=>setModal({show:false, day:"", from:0, to:0})}
        onConfirm={confirmReserve}
      />
    </div>
  );
}