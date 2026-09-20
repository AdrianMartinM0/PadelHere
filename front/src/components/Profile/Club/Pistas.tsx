import { useContext, useEffect, useState } from "react";
import CourtSelector from "./CourtSelector";
import CourtPanel from "./CourtPanel";
import ReserveModal from "./ReserveModal";
import { AuthContext } from "../../../context/AuthContext";
import { useReservasSocket } from "../../../hooks/useReservasSocket";
import { apiClient } from "../../../api/apiClient";
import { DayConfig, Training, CourtConfig } from "./CourtPanel";
import { Reserva } from "../../../components/principales/Reservas";

type Court = {
  id: string;
  name: string;
  desc?: string;
  config?: CourtConfig;
};

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

// Modal para mostrar errores de reserva
function ErrorModal({
  show,
  message,
  onClose,
}: {
  show: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#0007] z-50">
      <div className="bg-white dark:bg-gray-900 rounded p-6 shadow-lg min-w-[320px]">
        <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Error</h2>
        <p className="mb-4 dark:text-gray-200">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded border bg-blue-600 border-blue-700 text-white font-bold"
            onClick={onClose}
            type="button"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pistas({ clubId }: { clubId: string }) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [courtConfigs, setCourtConfigs] = useState<{ [courtId: string]: CourtConfig }>({});
  const [globalDays, setGlobalDays] = useState<{ [day: string]: DayConfig }>(makeDefaultGlobalDays());
  const [modal, setModal] = useState<{ show: boolean; day: string; from: number; to: number }>({ show: false, day: "", from: 0, to: 0 });
  const [loading, setLoading] = useState(true);

  // Estado para modal de eliminar
  const [deleteModal, setDeleteModal] = useState<{ show: boolean, courtId?: string, courtName?: string }>({ show: false });

  // Estado para los overrides globales
  const [globalOverrides, setGlobalOverrides] = useState<{ [date: string]: DayConfig }>({});

  // Estado para modal de error de reserva
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  // 🚩 IMPORTANTE: ahora obtenemos setReservaIds del contexto
  const { userData, setReservaIds } = useContext(AuthContext)!;

  useReservasSocket((data) => {
  if (data.club_id === clubId) {
    fetchAllCourtsAndConfigs();
    setModal({ show: false, day: "", from: 0, to: 0 });
  }
});

  // Función reutilizable para cargar datos de pistas + configs + overrides
  async function fetchAllCourtsAndConfigs() {
    setLoading(true);
    try {
      const [pistasData, configData, overridesData] = await Promise.all([
        apiClient.request<{ courts: Court[] }>(`/club/${clubId}/pistas`),
        apiClient.request<{ globalDays: { [day: string]: DayConfig }; [key: string]: unknown }>(`/club/${clubId}/config`),
        apiClient.request<{ [date: string]: DayConfig }>(`/club/${clubId}/overrides`)
      ]);

      setCourts(pistasData?.courts ?? []);
      // Court configs: recolecta la config de cada pista
const configs: { [courtId: string]: CourtConfig } = {};
      (pistasData?.courts ?? []).forEach((pista: Court) => {
        configs[pista.id] = pista.config ?? makeDefaultCourtConfig();
      });
      setCourtConfigs(configs);
      setSelectedCourt(prev =>
        pistasData?.courts?.some((p: Court) => p.id === prev)
          ? prev
          : pistasData?.courts?.[0]?.id ?? ""
      );
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
    } catch {
      setCourts([]);
      setCourtConfigs({});
      setSelectedCourt("");
      setGlobalDays(makeDefaultGlobalDays());
      setGlobalOverrides({});
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllCourtsAndConfigs();
  }, [clubId]);

  // Funciones para gestionar overrides globales...
  async function fetchGlobalOverrides() {
    try {
      const overrides = await apiClient.request<{ [date: string]: DayConfig }>(`/club/${clubId}/overrides`);
      setGlobalOverrides(overrides || {});
    } catch {
      setGlobalOverrides({});
    }
  }

  async function saveGlobalOverride(date: string, override: DayConfig) {
    await apiClient.request(`/club/${clubId}/overrides/${date}`, {
      method: "PUT",
      body: JSON.stringify(override),
    });
    fetchGlobalOverrides();
  }

  async function deleteGlobalOverride(date: string) {
    await apiClient.request(`/club/${clubId}/overrides/${date}`, {
      method: "DELETE",
    });
    fetchGlobalOverrides();
  }

  async function saveGlobalConfig(nextGlobalDays: { [day: string]: DayConfig }) {
    await apiClient.request(`/club/${clubId}/config`, {
      method: "PUT",
      body: JSON.stringify({
      globalDays: nextGlobalDays,
      }),
    });
  }

  async function saveCourtConfig(courtId: string, courtConfig: CourtConfig) {
    await apiClient.request(`/pista/${courtId}/config`, {
      method: "PUT",
      body: JSON.stringify({
        config: courtConfig,
      }),
    });
  }

  async function addCourt(name: string, desc?: string) {
    const newCourt = await apiClient.request<Court>(`/club/${clubId}/pistas`, {
      method: "POST",
      body: JSON.stringify({ name, desc }),
    });

    const newId = newCourt.id || newCourt._id || newCourt.pista_id;
    if (!newId) {
      console.error("Error: El backend no devolvió el id de la pista.");
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
  }

  async function editCourt(courtId: string, name: string, desc?: string) {
    await apiClient.request(`/pista/${courtId}`, {
      method: "PUT",
      body: JSON.stringify({ name, desc }),
    });
    const nextCourts = courts.map(c =>
      c.id === courtId ? { ...c, name, desc } : c
    );
    setCourts(nextCourts);
  }

  function deleteCourt(courtId: string) {
    const court = courts.find(c => c.id === courtId);
    setDeleteModal({ show: true, courtId, courtName: court?.name });
  }

  async function confirmDeleteCourt() {
    if (!deleteModal.courtId) return;
    await apiClient.request(`/pista/${deleteModal.courtId}`, {
      method: "DELETE"
    });
    const nextCourts = courts.filter(c => c.id !== deleteModal.courtId);
    const nextConfigs = { ...courtConfigs };
    delete nextConfigs[deleteModal.courtId!];

    setCourts(nextCourts);
    setCourtConfigs(nextConfigs);

    if (selectedCourt === deleteModal.courtId) {
      setSelectedCourt(nextCourts[0]?.id ?? "");
    }

    setDeleteModal({ show: false });
  }

  function cancelDeleteCourt() {
    setDeleteModal({ show: false });
  }

  // Añadir reserva y actualizar ids en AuthContext
  async function confirmReserve(name: string, phone: string) {
    try {
      const reserva = await apiClient.request<Reserva>(`/pista/${selectedCourt}/reservas`, {
        method: "POST",
        body: JSON.stringify({
          day: modal.day,
          from: modal.from,
          to: modal.to,
          name,
          phone,
        }),
      });
      
      await apiClient.request(`/usuario/${userData?.id}/reservas/${reserva._id}`, {
        method: "PUT"
      });
      setReservaIds?.((prev: string[]) => Array.from(new Set([...(prev || []), reserva._id])));

      // Vuelve a pedir todas las pistas/configs/overrides tras reservar
      fetchAllCourtsAndConfigs();

      setModal({ show: false, day: "", from: 0, to: 0 });
    } catch (err) {
      setErrorModal({ show: true, message: err instanceof Error ? err.message : "Error al reservar" });
    }
  }

  function handleReserve(day: string, from: number, to: number) {
    setModal({ show: true, day, from, to });
  }

  function handleSetGlobalDays(days: { [day: string]: DayConfig }) {
    setGlobalDays(days);
    saveGlobalConfig(days);
  }

  if (loading) {
    return (
      <div className="container mx-auto pr-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6 mt-6" />
        <div className="flex gap-4 mb-8">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 mt-6" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6 mt-6" />
        <div className="flex items-center justify-between my-2 px-2" >
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-36" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-36" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border-blue-400 p-6">
          {[...Array(7)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2 overflow-hidden">
              <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
              {[...Array(7)].map((_, idy) => (
                <div key={idy} className="min-w-30 h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const selectedCourtObj = courts.find(c => c.id === selectedCourt);

  return (
    <div className="container mx-auto pr-6">
      <h1 className="text-2xl dark:text-white font-bold mb-2">Gestión de Pistas</h1>
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
      <ErrorModal
        show={errorModal.show}
        message={errorModal.message}
        onClose={() => {
          setErrorModal({ show: false, message: "" });
          setModal({ show: false, day: "", from: 0, to: 0 }); // Cierra el modal de reserva al aceptar error
        }}
      />
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
      <div className="bg-white dark:bg-gray-900 rounded p-6 shadow-lg min-w-[320px]">
        <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Eliminar pista</h2>
        <p className="mb-4 dark:text-gray-200">
          ¿Seguro que quieres eliminar la pista <strong>{courtName ?? "seleccionada"}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-100"
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