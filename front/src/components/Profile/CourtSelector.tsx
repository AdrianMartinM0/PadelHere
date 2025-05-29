import { useState } from "react";

interface Court {
  id: string;
  name: string;
  desc?: string;
}
export default function CourtSelector({
  courts, selectedCourt, setSelectedCourt, addCourt
}:{
  courts: Court[],
  selectedCourt: string,
  setSelectedCourt: (id: string) => void,
  addCourt: (name: string) => void
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");

  return (
    <div className="flex gap-2 mb-4">
      {courts.map((c) => (
        <button
          key={c.id}
          className={`px-4 py-2 rounded font-medium border ${selectedCourt === c.id ? "bg-blue-100 border-blue-600" : "bg-white"}`}
          onClick={() => setSelectedCourt(c.id)}
          type="button"
        >{c.name}</button>
      ))}
      <button
        type="button"
        className="px-3 py-1 rounded border bg-green-100 border-green-400 font-bold text-green-700"
        onClick={() => setShowAdd(true)}
      >
        + Añadir pista
      </button>
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
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 rounded border bg-gray-100 border-gray-300"
                onClick={() => {
                  setShowAdd(false);
                  setNewCourtName("");
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1 rounded border bg-green-600 border-green-700 text-white font-bold"
                onClick={() => {
                  const name = newCourtName.trim() || `Pista ${courts.length + 1}`;
                  addCourt(name);
                  setShowAdd(false);
                  setNewCourtName("");
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
    </div>
  );
}