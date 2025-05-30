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

const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const defaultDayConfig = { open: "08:00", close: "23:00", closed: false, hasBreak: true, break: { from: "14:00", to: "16:00" } };

function makeDefaultConfig() {
  return {
    days: Object.fromEntries(weekDays.map(day => [day, { ...defaultDayConfig }])),
    overrides: {},
    trainings: [],
    reservas: [],
  };
}

export default function Pistas() {
  const [courts, setCourts] = useState(defaultCourts);
  const [selectedCourt, setSelectedCourt] = useState(courts[0].id);

  // Cada pista tiene TODA su config
  const [courtConfigs, setCourtConfigs] = useState<{ [courtId: string]: any }>({
    c1: makeDefaultConfig(),
    c2: makeDefaultConfig(),
  });

  // Para reservas
  const [modal, setModal] = useState<{ show: boolean, day: string, from: number, to: number }>({ show: false, day: "", from: 0, to: 0 });

  function handleReserve(day: string, from: number, to: number) {
    setModal({ show: true, day, from, to });
  }
  function confirmReserve(name: string, phone: string) {
    setCourtConfigs(prev => {
      const prevCfg = prev[selectedCourt];
      const nuevasReservas = [...(prevCfg.reservas || []), { day: modal.day, from: modal.from, to: modal.to, name, phone }];
      return {
        ...prev,
        [selectedCourt]: { ...prevCfg, reservas: nuevasReservas }
      };
    });
    setModal({ show: false, day: "", from: 0, to: 0 });
  }

  // Añadir pista
  function addCourt(name: string) {
    const newId = `c${courts.length + 1}`;
    setCourts(prev => [...prev, { id: newId, name, desc: "Nueva pista" }]);
    setCourtConfigs(prev => ({ ...prev, [newId]: makeDefaultConfig() }));
    setSelectedCourt(newId);
  }

  // Cambiar trainings SOLO para la pista seleccionada
  function setTrainingsForSelectedCourt(trainings: Training[]) {
    setCourtConfigs(prev => ({
      ...prev,
      [selectedCourt]: { ...prev[selectedCourt], trainings }
    }));
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
        config={courtConfigs[selectedCourt]}
        setConfig={cfg => setCourtConfigs(prev => ({ ...prev, [selectedCourt]: cfg }))}
        setTrainings={setTrainingsForSelectedCourt}
        reservas={courtConfigs[selectedCourt]?.reservas ?? []}
        onReserve={handleReserve}
      />
      <ReserveModal
        show={modal.show}
        day={modal.day}
        from={modal.from}
        to={modal.to}
        onClose={() => setModal({ show: false, day: "", from: 0, to: 0 })}
        onConfirm={confirmReserve}
      />
    </div>
  );
}