import { PencilLine, Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";

interface Court {
  id: string;
  name: string;
  desc?: string;
}

export default function CourtSelector({
  courts,
  selectedCourt,
  setSelectedCourt,
  addCourt,
  editCourt,
  deleteCourt,
}: {
  courts: Court[];
  selectedCourt: string;
  setSelectedCourt: (id: string) => void;
  addCourt: (name: string, desc?: string) => void;
  editCourt: (id: string, name: string, desc?: string) => void;
  deleteCourt: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");
  const [newCourtDesc, setNewCourtDesc] = useState("");

  // Estado para edición
  const [showEdit, setShowEdit] = useState(false);
  const [editCourtId, setEditCourtId] = useState<string | null>(null);
  const [editCourtName, setEditCourtName] = useState("");
  const [editCourtDesc, setEditCourtDesc] = useState("");

  // Abrir modal de edición
  const openEditModal = (court: Court) => {
    setEditCourtId(court.id);
    setEditCourtName(court.name);
    setEditCourtDesc(court.desc ?? "");
    setShowEdit(true);
  };

  // Guardar edición
  const handleEditCourt = () => {
    if (editCourtId) {
      editCourt(editCourtId, editCourtName.trim(), editCourtDesc.trim());
      setShowEdit(false);
      setEditCourtId(null);
      setEditCourtName("");
      setEditCourtDesc("");
    }
  };
  const { userType } = useContext(AuthContext)!;

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex flex-wrap gap-2">
        {courts.map((c) => (
          <div key={c.id} className="flex items-center gap-1">
            <button
              className={`px-4 py-2 rounded font-medium border ${selectedCourt === c.id
                ? "bg-blue-100 border-blue-600"
                : "bg-white"
                }`}
              onClick={() => setSelectedCourt(c.id)}
              type="button"
              title={c.desc}
            >
              {c.name}
            </button>
            {userType === "club" && (
              <div className="flex items-center gap-1">
                <button
                  className="text-blue-600 px-2"
                  title="Editar"
                  onClick={() => openEditModal(c)}
                  type="button"
                >
                  <PencilLine className="w-4" />
                </button>
                <button
                  className="text-red-600 px-2"
                  title="Eliminar"
                  onClick={() => {
                    deleteCourt(c.id);
                  }}
                  type="button"
                >
                  <Trash2 className="w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        {userType === "club" && (
          <button
            type="button"
            className="px-3 py-1 rounded border bg-green-100 border-green-400 font-bold text-green-700"
            onClick={() => setShowAdd(true)}
          >
            + Añadir pista
          </button>
        )}
      </div>

      {/* Modal Añadir */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0004] z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
            <h2 className="text-lg font-semibold mb-3">Nueva pista</h2>
            <label className="block mb-2">
              Nombre:
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mt-1"
                value={newCourtName}
                onChange={e => setNewCourtName(e.target.value)}
                autoFocus
              />
            </label>
            <label className="block mb-2">
              Descripción:
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mt-1"
                value={newCourtDesc}
                onChange={e => setNewCourtDesc(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 rounded border bg-gray-100 border-gray-300"
                onClick={() => {
                  setShowAdd(false);
                  setNewCourtName("");
                  setNewCourtDesc("");
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1 rounded border bg-green-600 border-green-700 text-white font-bold"
                onClick={() => {
                  const name = newCourtName.trim() || `Pista ${courts.length + 1}`;
                  const desc = newCourtDesc.trim();
                  addCourt(name, desc);
                  setShowAdd(false);
                  setNewCourtName("");
                  setNewCourtDesc("");
                }}
                type="button"
                disabled={!newCourtName.trim()}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0004] z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
            <h2 className="text-lg font-semibold mb-3">Editar pista</h2>
            <label className="block mb-2">
              Nombre:
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mt-1"
                value={editCourtName}
                onChange={e => setEditCourtName(e.target.value)}
                autoFocus
              />
            </label>
            <label className="block mb-2">
              Descripción:
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mt-1"
                value={editCourtDesc}
                onChange={e => setEditCourtDesc(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 rounded border bg-gray-100 border-gray-300"
                onClick={() => {
                  setShowEdit(false);
                  setEditCourtId(null);
                  setEditCourtName("");
                  setEditCourtDesc("");
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1 rounded border bg-blue-600 border-blue-700 text-white font-bold"
                onClick={handleEditCourt}
                type="button"
                disabled={!editCourtName.trim()}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}