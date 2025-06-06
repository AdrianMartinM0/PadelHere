import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function toTimeStr(m: number) {
  const x = m % (24 * 60);
  return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`;
}

// PopUp de reserva
function ReserveModal({
  show,
  from,
  to,
  day,
  onClose,
  onConfirm,
}: {
  show: boolean;
  from: number;
  to: number;
  day: string;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
}) {
  const { userType, userData } = useContext(AuthContext)!;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (userType && userType !== "club") {
      setName(userData?.name || "");
      setPhone(userData?.tel?.toString() || "");
    }
  }, [userData, userType]);

  // El input de teléfono solo es editable para usuarios que no sean club y no tengan teléfono guardado
  const condition = userType === "club" ? !(userType === "club") : userData?.tel != null;

  // Validación personalizada JS
  const validatePhone = (value: string) => {
    // Solo permite números, exactamente 9 dígitos
    if (!/^[0-9]{9}$/.test(value)) {
      setPhoneError("El teléfono debe tener exactamente 9 dígitos numéricos.");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  // Si el modal no está visible, no renderizar nada
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#0004] dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded shadow-lg p-6 w-80" no-validate="true">
        <h3 className="text-lg font-bold mb-4 dark:text-gray-100">
          Reservar {day}
        </h3>
        <p className="mb-2 text-sm dark:text-gray-200">
          Horario: {toTimeStr(from)} - {toTimeStr(to)}
        </p>
        <div className="mb-3">
          <label className="block text-sm font-semibold dark:text-gray-200">
            Nombre:
          </label>
          <input
            disabled={userType !== "club"}
            className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold dark:text-gray-200">
            Teléfono:
          </label>
          <input
            disabled={condition}
            className={`border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${phoneError ? "border-red-500" : ""}`}
            value={phone}
            // No type="number", así evitamos validación HTML nativa y controlamos el input
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={e => {
              // permite solo números en el input
              const val = e.target.value.replace(/[^0-9]/g, "");
              setPhone(val);
              if (val.length === 9) {
                validatePhone(val);
              } else {
                setPhoneError(null);
              }
            }}
            onBlur={e => validatePhone(e.target.value)}
            autoComplete="off"
          />
          {phoneError && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              {phoneError}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 bg-gray-300 dark:bg-gray-700 dark:text-gray-100 rounded"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 bg-blue-600 dark:bg-blue-800 text-white rounded"
            type="button"
            onClick={() => {
              // Validación antes de confirmar
              const validPhone = validatePhone(phone);
              if (name && phone && validPhone) {
                onConfirm(name, phone);
                setName("");
                setPhone("");
                setPhoneError(null);
              } else if (!validPhone) {
                // Nada, el error ya está seteado
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

export default ReserveModal;