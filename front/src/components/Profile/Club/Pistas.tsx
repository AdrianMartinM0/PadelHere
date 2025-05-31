import { useEffect, useState } from "react";
import CourtSelector from "./CourtSelector";
import CourtPanel from "./CourtPanel";
import ReserveModal from "./ReserveModal";

const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const defaultDayConfig = { open: "08:00", close: "23:00", closed: false, hasBreak: true, break: { from: "14:00", to: "16:00" } };

// Genera config de días global
function makeDefaultGlobalDays() {
  return Object.fromEntries(weekDays.map(day => [day, { ...defaultDayConfig }]));
}

// Config específica de pista (solo overrides, trainings y reservas)
function makeDefaultCourtConfig() {
  return {
    overrides: {},
    trainings: [],
    reservas: [],
  };
}

export default function Pistas({ clubId }: { clubId: string }) {
  const [courts, setCourts] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [courtConfigs, setCourtConfigs] = useState<{ [courtId: string]: any }>({});
  const [globalDays, setGlobalDays] = useState<{ [day: string]: any }>(makeDefaultGlobalDays());
  const [modal, setModal] = useState<{ show: boolean, day: string, from: number, to: number }>({ show: false, day: "", from: 0, to: 0 });
  const [loading, setLoading] = useState(true);

  // Estado para modal de eliminar
  const [deleteModal, setDeleteModal] = useState<{ show: boolean, courtId?: string, courtName?: string }>({ show: false });

  // Estado para los overrides globales
  const [globalOverrides, setGlobalOverrides] = useState<{ [date: string]: any }>({});

  // Cargar datos iniciales, incluyendo los overrides globales
  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:8000/v1/club/${clubId}/pistas`).then(res => res.json()),
      fetch(`http://localhost:8000/v1/club/${clubId}/config`).then(res => res.json()),
      fetch(`http://localhost:8000/v1/club/${clubId}/overrides`).then(res => res.json())
    ])
      .then(([pistasData, configData, overridesData]) => {
        setCourts(pistasData?.courts ?? []);
        // Court configs: recolecta la config de cada pista
        const configs: { [courtId: string]: any } = {};
        (pistasData?.courts ?? []).forEach((pista: any) => {
          configs[pista.id] = pista.config ?? makeDefaultCourtConfig();
        });
        setCourtConfigs(configs);
        setSelectedCourt(pistasData?.courts?.[0]?.id ?? "");
        // Config global del club
        if (configData?.globalDays) {
          setGlobalDays({
            ...makeDefaultGlobalDays(),
            ...configData.globalDays,
          });
        } else {
          setGlobalDays(makeDefaultGlobalDays());
        }
        setGlobalOverrides(overridesData || {});
        setLoading(false);
      })
      .catch(() => {
        setCourts([]);
        setCourtConfigs({});
        setSelectedCourt("");
        setGlobalDays(makeDefaultGlobalDays());
        setGlobalOverrides({});
        setLoading(false);
      });
  }, [clubId]);

  // Funciones para gestionar overrides globales
  function fetchGlobalOverrides() {
    fetch(`http://localhost:8000/v1/club/${clubId}/overrides`)
      .then(res => res.json())
      .then(setGlobalOverrides)
      .catch(() => setGlobalOverrides({}));
  }

  function saveGlobalOverride(date: string, override: any) {
    fetch(`http://localhost:8000/v1/club/${clubId}/overrides/${date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(override),
    }).then(() => fetchGlobalOverrides());
  }

  function deleteGlobalOverride(date: string) {
    fetch(`http://localhost:8000/v1/club/${clubId}/overrides/${date}`, {
      method: "DELETE",
    }).then(() => fetchGlobalOverrides());
  }

  // Guardar cambios en la configuración global del club
  function saveGlobalConfig(nextGlobalDays: any) {
    fetch(`http://localhost:8000/v1/club/${clubId}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        globalDays: nextGlobalDays,
      }),
    }).then(res => console.log("Config global guardada:", res.status));
  }

  // Guardar cambios en la configuración de una pista específica
  function saveCourtConfig(courtId: string, courtConfig: any) {
    fetch(`http://localhost:8000/v1/pista/${courtId}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: courtConfig,
      }),
    }).then(res => console.log(`Config de pista ${courtId} guardada:`, res.status));
  }

  // Añadir pista
  function addCourt(name: string, desc?: string) {
    fetch(`http://localhost:8000/v1/club/${clubId}/pistas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, desc }),
    })
      .then(res => res.json())
      .then(newCourt => {
        const newId = newCourt.id || newCourt._id || newCourt.pista_id;
        if (!newId) {
          alert("Error: El backend no devolvió el id de la pista.");
          return;
        }
        const courtObj = {
          id: newId,
          name: newCourt.name || name,
          desc: newCourt.desc || desc,
        };
        const nextCourts = [...courts, courtObj];
        const nextConfigs = { ...courtConfigs, [newId]: makeDefaultCourtConfig() };
        setCourts(nextCourts);
        setCourtConfigs(nextConfigs);
        setSelectedCourt(newId);

        saveCourtConfig(newId, makeDefaultCourtConfig());
      });
  }

  // Editar pista (nombre/desc)
  function editCourt(courtId: string, name: string, desc?: string) {
    fetch(`http://localhost:8000/v1/pista/${courtId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, desc }),
    }).then(() => {
      const nextCourts = courts.map(c =>
        c.id === courtId ? { ...c, name, desc } : c
      );
      setCourts(nextCourts);
    });
  }

  // Eliminar pista con modal en vez de confirm
  function deleteCourt(courtId: string) {
    const court = courts.find(c => c.id === courtId);
    setDeleteModal({ show: true, courtId, courtName: court?.name });
  }

  function confirmDeleteCourt() {
    if (!deleteModal.courtId) return;
    fetch(`http://localhost:8000/v1/pista/${deleteModal.courtId}`, {
      method: "DELETE"
    }).then(() => {
      const nextCourts = courts.filter(c => c.id !== deleteModal.courtId);
      const nextConfigs = { ...courtConfigs };
      delete nextConfigs[deleteModal.courtId!];

      setCourts(nextCourts);
      setCourtConfigs(nextConfigs);

      if (selectedCourt === deleteModal.courtId) {
        setSelectedCourt(nextCourts[0]?.id ?? "");
      }

      setDeleteModal({ show: false });
    });
  }

  function cancelDeleteCourt() {
    setDeleteModal({ show: false });
  }

  // Añadir reserva
  function confirmReserve(name: string, phone: string) {
    setCourtConfigs(prev => {
      const prevCfg = prev[selectedCourt];
      const nuevasReservas = [...(prevCfg?.reservas || []), { day: modal.day, from: modal.from, to: modal.to, name, phone }];
      const nextConfig = { ...prevCfg, reservas: nuevasReservas };
      saveCourtConfig(selectedCourt, nextConfig);

      return {
        ...prev,
        [selectedCourt]: nextConfig
      };
    });
    setModal({ show: false, day: "", from: 0, to: 0 });
  }

  function handleReserve(day: string, from: number, to: number) {
    setModal({ show: true, day, from, to });
  }

  // Guardar cambios en la config global desde ConfigPanel
  function handleSetGlobalDays(days: { [day: string]: any }) {
    setGlobalDays(days);
    saveGlobalConfig(days);
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando pistas...</div>;
  }

  const selectedCourtObj = courts.find(c => c.id === selectedCourt);

  return (
    <div className="container mx-auto pr-6">
      <h1 className="text-2xl font-bold mb-2">Gestión de Pistas</h1>
      <CourtSelector
        courts={courts}
        selectedCourt={selectedCourt}
        setSelectedCourt={setSelectedCourt}
        addCourt={addCourt}
        editCourt={editCourt}
        deleteCourt={deleteCourt}
      />
      <CourtPanel
        court={selectedCourtObj}
        globalDays={globalDays}
        setGlobalDays={handleSetGlobalDays}
        config={courtConfigs[selectedCourt] ?? makeDefaultCourtConfig()}
        setConfig={cfg => {
          setCourtConfigs(prev => {
            saveCourtConfig(selectedCourt, cfg);
            return { ...prev, [selectedCourt]: cfg };
          });
        }}
        reservas={courtConfigs[selectedCourt]?.reservas ?? []}
        onReserve={handleReserve}
        globalOverrides={globalOverrides}
        saveGlobalOverride={saveGlobalOverride}
        deleteGlobalOverride={deleteGlobalOverride}
      />
      <ReserveModal
        show={modal.show}
        day={modal.day}
        from={modal.from}
        to={modal.to}
        onClose={() => setModal({ show: false, day: "", from: 0, to: 0 })}
        onConfirm={confirmReserve}
      />
      {deleteModal.show && (
        <DeleteCourtModal
          show={deleteModal.show}
          courtName={deleteModal.courtName}
          onCancel={cancelDeleteCourt}
          onConfirm={confirmDeleteCourt}
        />
      )}
    </div>
  );
}

// Modal de confirmación de borrado
function DeleteCourtModal({
  show,
  courtName,
  onCancel,
  onConfirm,
}: {
  show: boolean;
  courtName?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#0007] z-50">
      <div className="bg-white rounded p-6 shadow-lg min-w-[320px]">
        <h2 className="text-lg font-semibold mb-4">Eliminar pista</h2>
        <p className="mb-4">
          ¿Seguro que quieres eliminar la pista <strong>{courtName ?? "seleccionada"}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded border bg-gray-100 border-gray-300"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded border bg-red-600 border-red-700 text-white font-bold"
            onClick={onConfirm}
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}