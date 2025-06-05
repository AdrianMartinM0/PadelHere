import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";


function pad(n: number) { return n.toString().padStart(2, "0"); }
function toTimeStr(m: number) { const x = m % (24*60); return `${pad(Math.floor(x/60))}:${pad(x%60)}`; }

// PopUp de reserva
function ReserveModal({show, from, to, day, onClose, onConfirm}:{show:boolean,from:number,to:number,day:string,onClose:()=>void,onConfirm:(name:string,phone:string)=>void}) {
  const { userType, userData } = useContext(AuthContext)!;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  useEffect(() => {
    if (userType && userType !== "club") {
      setName(userData?.name || "");
      setPhone(userData?.tel?.toString() || "");
    }
  }
  , [userData, userType]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-[#0004] flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-80">
        <h3 className="text-lg font-bold mb-4">Reservar {day}</h3>
        <p className="mb-2 text-sm">Horario: {toTimeStr(from)} - {toTimeStr(to)}</p>
        <div className="mb-3">
          <label className="block text-sm font-semibold">Nombre:</label>
          <input disabled={userType !== "club"} className="border rounded px-2 py-1 w-full" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold">Teléfono:</label>
          <input disabled={!(userType === "club" || (userType === "usuario" && !userData?.tel))} className="border rounded px-2 py-1 w-full" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-300 rounded" onClick={onClose}>Cancelar</button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => {
              if (name && phone) {
                onConfirm(name,phone);
                setName(""); setPhone("");
              }
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReserveModal