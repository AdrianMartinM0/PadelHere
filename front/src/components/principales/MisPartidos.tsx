import { useContext, useEffect, useRef, useState } from "react";
import { MapPin, Calendar, Clock, X, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// ----------- MODAL COMPONENTS ----------------

function validateSetScore(p1: string, p2: string) {
  const n1 = Number(p1), n2 = Number(p2);
  if (isNaN(n1) || isNaN(n2)) return false;
  if (n1 === n2) return false;
  if (n1 < 0 || n2 < 0 || n1 > 7 || n2 > 7) return false;
  if (n1 === 6 && n2 === 6) return false;
  if (n1 === 7 && !(n2 === 5 || n2 === 6)) return false;
  if (n2 === 7 && !(n1 === 5 || n1 === 6)) return false;
  if (n1 === 6 && n2 > 4 && n2 !== 7) return false;
  if (n2 === 6 && n1 > 4 && n1 !== 7) return false;
  if (n1 < 6 && n2 < 6) return false;
  return true;
}

function autoCorrectSet(p1: string, p2: string): [string, string] {
  let n1 = Number(p1), n2 = Number(p2);
  if (n1 === 7 && !(n2 === 5 || n2 === 6)) n2 = n2 <= 5 ? 5 : 6;
  if (n2 === 7 && !(n1 === 5 || n1 === 6)) n1 = n1 <= 5 ? 5 : 6;
  if (n1 > 7) n1 = 7;
  if (n2 > 7) n2 = 7;
  if (n1 < 0) n1 = 0;
  if (n2 < 0) n2 = 0;
  return [n1.toString(), n2.toString()];
}

const ProponerResultadoModal = ({
  show,
  onClose,
  onSubmit,
}: {
  show: boolean;
  onClose: () => void;
  onSubmit: (resultado: string) => void;
}) => {
  // --- INICIALIZACIÓN DE CAMPOS ---
  const [set1p1, setSet1p1] = useState("");
  const [set1p2, setSet1p2] = useState("");
  const [set2p1, setSet2p1] = useState("");
  const [set2p2, setSet2p2] = useState("");
  const [set3p1, setSet3p1] = useState("");
  const [set3p2, setSet3p2] = useState("");
  const [error, setError] = useState<string | null>(null);

  // --- REINICIAR CAMPOS CUANDO EL MODAL SE ABRE ---
  useEffect(() => {
    if (show) {
      setSet1p1("");
      setSet1p2("");
      setSet2p1("");
      setSet2p2("");
      setSet3p1("");
      setSet3p2("");
      setError(null);
    }
  }, [show]);

  function handleSet(set: number, player: number, value: string) {
    let v = value.replace(/^0+/, "");
    if (v.length > 1 && v.startsWith("0")) v = v.slice(1);
    if (v.length > 1) v = v.slice(0, 2);
    if (!/^\d*$/.test(v)) return;
    let valA = v, valB = "";
    switch (set) {
      case 1:
        valB = player === 1 ? set1p2 : set1p1;
        [valA, valB] = player === 1 ? autoCorrectSet(valA, valB) : autoCorrectSet(valB, valA).reverse();
        player === 1 ? (setSet1p1(valA), setSet1p2(valB)) : (setSet1p2(valA), setSet1p1(valB));
        break;
      case 2:
        valB = player === 1 ? set2p2 : set2p1;
        [valA, valB] = player === 1 ? autoCorrectSet(valA, valB) : autoCorrectSet(valB, valA).reverse();
        player === 1 ? (setSet2p1(valA), setSet2p2(valB)) : (setSet2p2(valA), setSet2p1(valB));
        break;
      case 3:
        valB = player === 1 ? set3p2 : set3p1;
        [valA, valB] = player === 1 ? autoCorrectSet(valA, valB) : autoCorrectSet(valB, valA).reverse();
        player === 1 ? (setSet3p1(valA), setSet3p2(valB)) : (setSet3p2(valA), setSet3p1(valB));
        break;
      default:
        break;
    }
  }

  const showSet3 = () => {
    if (
      set1p1 !== "" &&
      set1p2 !== "" &&
      set2p1 !== "" &&
      set2p2 !== "" &&
      set1p1 !== set1p2 &&
      set2p1 !== set2p2 &&
      validateSetScore(set1p1, set1p2) &&
      validateSetScore(set2p1, set2p2)
    ) {
      const primero = Number(set1p1) > Number(set1p2) ? 1 : 2;
      const segundo = Number(set2p1) > Number(set2p2) ? 1 : 2;
      return primero !== segundo;
    }
    return false;
  };

  const resultadoString = () => {
    let res = `${set1p1}-${set1p2} ${set2p1}-${set2p2}`;
    if (showSet3() && set3p1 !== "" && set3p2 !== "") {
      res += ` ${set3p1}-${set3p2}`;
    }
    return res;
  };

  const handleSubmit = () => {
    if (!validateSetScore(set1p1, set1p2) || !validateSetScore(set2p1, set2p2)) {
      setError("Rellena correctamente los dos primeros sets (marcadores válidos, sin empate, hasta 7).");
      return;
    }
    if (showSet3() && !validateSetScore(set3p1, set3p2)) {
      setError("Rellena correctamente el tercer set (marcador válido).");
      return;
    }
    setError(null);
    onSubmit(resultadoString());
    // --- REINICIAR CAMPOS TRAS PROPONER ---
    setSet1p1("");
    setSet1p2("");
    setSet2p1("");
    setSet2p2("");
    setSet3p1("");
    setSet3p2("");
  };

  if (!show) return null;
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <button
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        onClick={onClose}
      >
        <X size={24} />
      </button>
      <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Proponer resultado</h2>
      <div className="mb-2 dark:text-gray-200">Introduce el resultado set a set:</div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold dark:text-gray-100">Set 1:</span>
          <input
            type="number"
            min={0}
            max={7}
            className="w-14 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-center dark:bg-gray-800 dark:text-gray-100"
            value={set1p1}
            onChange={e => handleSet(1, 1, e.target.value)}
            placeholder="P1"
          />
          <span className="dark:text-gray-200">-</span>
          <input
            type="number"
            min={0}
            max={7}
            className="w-14 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-center dark:bg-gray-800 dark:text-gray-100"
            value={set1p2}
            onChange={e => handleSet(1, 2, e.target.value)}
            placeholder="P2"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold dark:text-gray-100">Set 2:</span>
          <input
            type="number"
            min={0}
            max={7}
            className="w-14 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-center dark:bg-gray-800 dark:text-gray-100"
            value={set2p1}
            onChange={e => handleSet(2, 1, e.target.value)}
            placeholder="P1"
          />
          <span className="dark:text-gray-200">-</span>
          <input
            type="number"
            min={0}
            max={7}
            className="w-14 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-center dark:bg-gray-800 dark:text-gray-100"
            value={set2p2}
            onChange={e => handleSet(2, 2, e.target.value)}
            placeholder="P2"
          />
        </div>
        {showSet3() && (
          <div className="flex items-center gap-3">
            <span className="font-semibold dark:text-gray-100">Set 3:</span>
            <input
              type="number"
              min={0}
              max={7}
              className="w-14 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-center dark:bg-gray-800 dark:text-gray-100"
              value={set3p1}
              onChange={e => handleSet(3, 1, e.target.value)}
              placeholder="P1"
            />
            <span className="dark:text-gray-200">-</span>
            <input
              type="number"
              min={0}
              max={7}
              className="w-14 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-center dark:bg-gray-800 dark:text-gray-100"
              value={set3p2}
              onChange={e => handleSet(3, 2, e.target.value)}
              placeholder="P2"
            />
          </div>
        )}
      </div>
      {error && <div className="text-red-500 dark:text-red-400 mt-2">{error}</div>}
      <div className="flex justify-end gap-2 mt-6">
        <button
          className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          className={`px-4 py-2 rounded bg-blue-600 dark:bg-blue-800 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition`}
          onClick={handleSubmit}
        >
          Proponer
        </button>
      </div>
    </div>
  </div>
);
};

const Modal = ({
  show,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Confirmar",
  disableSubmit = false,
}: {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (() => void) | undefined;
  submitLabel?: string;
  disableSubmit?: boolean;
}) => {
  if (!show) return null;
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <button
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        onClick={onClose}
      >
        <X size={24} />
      </button>
      <h2 className="text-xl font-bold mb-4 dark:text-gray-100">{title}</h2>
      <div className="dark:text-gray-200">{children}</div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          Cancelar
        </button>
        {onSubmit && (
          <button
            className={`px-4 py-2 rounded bg-blue-600 dark:bg-blue-800 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition ${disableSubmit ? "opacity-50 cursor-not-allowed" : ""
              }`}
            onClick={onSubmit}
            disabled={disableSubmit}
          >
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);
};

// ... tipos y helpers igual que antes

type UserProfile = {
  _id: string;
  name: string;
  img_perfil?: string;
};

type PartidoResultado = {
  estado: "pendiente_confirmacion" | "confirmado" | "rechazado";
  propuesto_por: string;
  resultado: string;
  confirmado_por?: string;
  confirmado?: boolean;
  rechazado_por?: string;
  fecha_propuesta?: string;
  fecha_confirmacion?: string;
  fecha_rechazo?: string;
};

type Partido = {
  _id: string;
  localizacion: string;
  fecha: string;
  hora: string;
  created_by: string;
  pareja1_jugador1?: string;
  pareja1_jugador2?: string;
  pareja2_jugador1?: string;
  pareja2_jugador2?: string;
  resultado?: PartidoResultado;
  created_at: string;
  updated_at: string;
};

const formatDateMadrid = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
};

const getPartidoDate = (partido: Partido) => {
  if (!partido.fecha || !partido.hora) return new Date(0);
  return new Date(`${partido.fecha}T${partido.hora}:00`);
};

const isPartidoPasado = (partido: Partido) => {
  const partidoDate = getPartidoDate(partido);
  const nowMadrid = new Date(new Date().toLocaleString("sv-SE", { timeZone: "Europe/Madrid" }).replace(" ", "T"));
  return partidoDate.getTime() < nowMadrid.getTime();
};

const isPartidoFuturo = (partido: Partido) => {
  const partidoDate = getPartidoDate(partido);
  const nowMadrid = new Date(new Date().toLocaleString("sv-SE", { timeZone: "Europe/Madrid" }).replace(" ", "T"));
  return partidoDate.getTime() >= nowMadrid.getTime();
};

const isPartidoCompleto = (p: Partido) =>
  p.pareja1_jugador1 && p.pareja1_jugador2 && p.pareja2_jugador1 && p.pareja2_jugador2;

const esDePareja1 = (userId: string, p: Partido) =>
  userId === p.pareja1_jugador1 || userId === p.pareja1_jugador2;
const esDePareja2 = (userId: string, p: Partido) =>
  userId === p.pareja2_jugador1 || userId === p.pareja2_jugador2;

// --- NUEVO: helpers para victoria/derrota ---

function getWinnerPareja(resultado: string): "pareja1" | "pareja2" | null {
  if (!resultado) return null;
  const sets = resultado.split(" ").filter(Boolean);
  let p1 = 0, p2 = 0;
  sets.forEach(set => {
    const [a, b] = set.split("-").map(Number);
    if (isNaN(a) || isNaN(b)) return;
    if (a > b) p1++;
    else p2++;
  });
  if (p1 > p2) return "pareja1";
  if (p2 > p1) return "pareja2";
  return null;
}

function getUserPareja(userId: string | null | undefined, partido: Partido): "pareja1" | "pareja2" | null {
  if (!userId) return null;
  if (userId === partido.pareja1_jugador1 || userId === partido.pareja1_jugador2) return "pareja1";
  if (userId === partido.pareja2_jugador1 || userId === partido.pareja2_jugador2) return "pareja2";
  return null;
}

// --- FIN helpers victoria/derrota ---

const MisPartidos = () => {
  const { userData } = useContext(AuthContext)!;
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, UserProfile>>({});
  const [view, setView] = useState<"pendientes" | "pasados">("pendientes");
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);

  // Modal state
  const [modal, setModal] = useState<{
    show: boolean;
    type?: "proponer" | "confirmar" | "rechazar" | null;
    partidoId?: string;
    resultadoActual?: string;
  }>({ show: false });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPartidosUsuario = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://padelhere-production.up.railway.app/v1/partido/usuario/${userData?.id}/mis-partidos`
      );
      if (!res.ok) throw new Error("No se pudieron cargar tus partidos");
      let data: Partido[] = await res.json();
      // Ordena partidos por fecha y hora (más cercano primero)
      data = data.sort((a, b) => getPartidoDate(a).getTime() - getPartidoDate(b).getTime());
      setPartidos(data);
      const allIds = new Set<string>();
      data.forEach((p) => {
        [
          p.pareja1_jugador1,
          p.pareja1_jugador2,
          p.pareja2_jugador1,
          p.pareja2_jugador2,
        ].forEach((slot) => {
          if (slot && typeof slot === "string") allIds.add(slot);
        });
      });
      const idsToFetch = Array.from(allIds).filter((id) => !(id in userCache));
      if (idsToFetch.length > 0) {
        Promise.all(
          idsToFetch.map((id) =>
            fetch(`https://padelhere-production.up.railway.app/v1/usuario/${id}`)
              .then((res) => (res.ok ? res.json() : null))
              .then((profile) => (profile ? { id, profile } : null))
          )
        ).then((results) => {
          const newCache: Record<string, UserProfile> = {};
          results.forEach((res) => {
            if (res && res.profile) {
              newCache[res.id] = res.profile;
            }
          });
          setUserCache((prev) => ({ ...prev, ...newCache }));
        });
      }
    } catch (error) {
      setPartidos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (wsRef.current) return;
    const ws = new WebSocket("wss://padelhere-production.up.railway.app/ws/partidos");
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "new_player") {
          fetchPartidosUsuario();
        }
      } catch (e) { }
    };
    ws.onclose = () => {
      wsRef.current = null;
    };
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!userData?.id) return;
    fetchPartidosUsuario();
  }, [userData?.id]);

  const handleJoin = async (partidoId: string, slot: string) => {
    try {
      const userId = userData?.id;
      if (!userId) {
        setModal({
          show: true,
          type: null,
        });
        return;
      }
      const res = await fetch(`https://padelhere-production.up.railway.app/v1/partido/${partidoId}/join/${slot}?user_id=${userId}`, {
        method: "POST"
      });
      if (!res.ok) {
        setModal({
          show: true,
          type: null,
        });
        return;
      }
    } catch (e) {
      setModal({
        show: true,
        type: null,
      });
    }
  }

  const handleLeave = async (partidoId: string, slot: string) => {
    try {
      const userId = userData?.id;
      if (!userId) {
        setModal({
          show: true,
          type: null,
        });
        return;
      }
      const res = await fetch(
        `https://padelhere-production.up.railway.app/v1/partido/${partidoId}/leave/${slot}?user_id=${userId}`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("No se pudo salir del partido");
    } catch (e) {
      setModal({
        show: true,
        type: null,
      });
    }
  };

  const handleProponerResultado = (partidoId: string) => {
    setModal({
      show: true,
      type: "proponer",
      partidoId,
    });
  };

  const handleProponerResultadoSubmit = async (resultado: string) => {
    const partidoId = modal.partidoId;
    if (!partidoId) return;
    try {
      await fetch(
        `https://padelhere-production.up.railway.app/v1/partido/${partidoId}/proponer-resultado?propuesto_por=${userData?.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultado),
        }
      );
      setModal({ show: false });
      setTimeout(fetchPartidosUsuario, 700);
    } catch (e) {
      setModal({ show: false });
    }
  };

  const handleConfirmarResultado = (partidoId: string, resultado: string) => {
    setModal({
      show: true,
      type: "confirmar",
      partidoId,
      resultadoActual: resultado,
    });
  };

  const handleRechazarResultado = (partidoId: string, resultado: string) => {
    setModal({
      show: true,
      type: "rechazar",
      partidoId,
      resultadoActual: resultado,
    });
  };

  const submitConfirmarResultado = async () => {
    if (isSubmitting) return; // Previene doble click
    setIsSubmitting(true);
    const partidoId = modal.partidoId;
    if (!partidoId) return;
    try {
      await fetch(
        `https://padelhere-production.up.railway.app/v1/partido/${partidoId}/confirmar-resultado?user_id=${userData?.id}`,
        {
          method: "POST",
        }
      );
      setModal({ show: false });
      setTimeout(fetchPartidosUsuario, 700);
    } catch (e) {
      setModal({ show: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRechazarResultado = async () => {
    const partidoId = modal.partidoId;
    if (!partidoId) return;
    try {
      await fetch(
        `https://padelhere-production.up.railway.app/v1/partido/${partidoId}/rechazar-resultado?user_id=${userData?.id}`,
        {
          method: "POST",
        }
      );
      setModal({ show: false });
      setTimeout(fetchPartidosUsuario, 700);
    } catch (e) {
      setModal({ show: false });
    }
  };

  const LeaveButton = ({ partidoId, slot }: { partidoId: string; slot: string }) => (
    <button
      className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center bg-white text-red-600 hover:bg-red-100 transition absolute -top-2 -right-2 z-10"
      title="Salir del partido"
      onClick={() => handleLeave(partidoId, slot)}
      style={{ fontSize: 12, lineHeight: 1, padding: 0 }}
    >
      <X size={16} className="text-red-600" strokeWidth={3} />
    </button>
  );

  const PlayerCircle = ({
    userId,
    partidoId,
    slot,
    isPast,
    highlight
  }: {
    userId: string | null | undefined,
    partidoId: string,
    slot: string,
    isPast?: boolean,
    highlight?: "win" | "lose" | null
  }) => {
    const isOwnSlot = userId && userData?.id && userId === userData.id;
    const profile = userId ? userCache[userId] : undefined;
    const highlightClass =
      highlight === "win"
        ? "ring-4 ring-green-400 rounded-full"
        : highlight === "lose"
          ? "ring-4 ring-red-400 rounded-full"
          : "";

    if (isPast) {
      return (
  <div className={`relative flex items-center justify-center ${highlightClass}`}>
    {!userId ? (
      <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-blue-400 dark:text-blue-300 font-bold text-lg">
        <span>?</span>
      </div>
    ) : (
      <Link
        to={`/app/usuario/${userId}`}
        className="w-12 h-12 rounded-full border-2 border-blue-500 dark:border-blue-400 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg transition"
        title={profile?.name}
        onClick={() => navigate(`/perfil/${userId}`)}
        type="button"
      >
        {profile?.img_perfil ? (
          <img
            src={`data:image/jpeg;base64,${profile.img_perfil}`}
            alt={profile.name || "Jugador"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">
            {profile?.name?.[0]?.toUpperCase() || "?"}
          </span>
        )}
      </Link>
    )}
  </div>
);
    }

    return (
  <div className="relative flex items-center justify-center">
    {isOwnSlot && <LeaveButton partidoId={partidoId} slot={slot} />}
    {!userId ? (
      <button
        className="w-12 h-12 rounded-full border-2 border-blue-500 dark:border-blue-400 flex items-center justify-center bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900 transition"
        title="Unirse"
        onClick={() => handleJoin(partidoId, slot)}
      >
        <Plus size={28} className="text-blue-600 dark:text-blue-300" />
      </button>
    ) : (
      <Link
        to={`/app/usuario/${userId}`}
        className="w-12 h-12 rounded-full border-2 border-blue-500 dark:border-blue-400 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg transition"
        title={profile?.name}
        onClick={() => navigate(`/perfil/${userId}`)}
        type="button"
      >
        {profile?.img_perfil ? (
          <img
            src={`data:image/jpeg;base64,${profile.img_perfil}`}
            alt={profile.name || "Jugador"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">
            {profile?.name?.[0]?.toUpperCase() || "?"}
          </span>
        )}
      </Link>
    )}
  </div>
);
  };

  const PartidoCard = (partido: Partido, isPast = false) => {
    let accionesResultado: React.ReactNode = null;
    if (isPast && isPartidoCompleto(partido)) {
      const puedeProponerResultado =
        (
          !partido.resultado ||
          (partido.resultado && partido.resultado.estado === "rechazado")
        ) &&
        [partido.pareja1_jugador1, partido.pareja1_jugador2, partido.pareja2_jugador1, partido.pareja2_jugador2].includes(userData?.id);
      const puedeConfirmarORechazar =
        partido.resultado &&
        partido.resultado.estado === "pendiente_confirmacion" &&
        userData?.id &&
        (
          (esDePareja1(partido.resultado.propuesto_por, partido) && esDePareja2(userData.id, partido)) ||
          (esDePareja2(partido.resultado.propuesto_por, partido) && esDePareja1(userData.id, partido))
        );

      const resultadoConfirmado = partido.resultado && partido.resultado.estado === "confirmado";

      if (puedeProponerResultado) {
        accionesResultado = (
          <button
            className="mt-3 px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
            onClick={() => handleProponerResultado(partido._id)}
          >
            Proponer resultado
          </button>
        );
      } else if (puedeConfirmarORechazar) {
        accionesResultado = (
          <div className="flex flex-col gap-2 mt-3">
            <div className="font-semibold text-blue-600">
              Resultado propuesto: {partido.resultado?.resultado}
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                onClick={() => handleConfirmarResultado(partido._id, partido.resultado?.resultado || "")}
              >
                Confirmar
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                onClick={() => handleRechazarResultado(partido._id, partido.resultado?.resultado || "")}
              >
                Rechazar
              </button>
            </div>
          </div>
        );
      } else if (resultadoConfirmado) {
        accionesResultado = (
          <div className="mt-3 font-bold text-blue-800">
            Resultado confirmado: {partido.resultado?.resultado}
          </div>
        );
      } else if (partido.resultado && partido.resultado.estado === "pendiente_confirmacion") {
        accionesResultado = (
          <div className="mt-3 text-blue-700 font-semibold">
            Resultado propuesto: {partido.resultado?.resultado}<br />
            Pendiente de confirmación por la pareja rival.
          </div>
        );
      } else if (partido.resultado && partido.resultado.estado === "rechazado") {
        accionesResultado = (
          <div className="mt-3 text-red-600 font-semibold">
            El resultado fue rechazado. Debe proponerse uno nuevo.
          </div>
        );
      }
    }

    // Lógica victoria/derrota para highlight
    const resultadoConfirmado = partido.resultado && partido.resultado.estado === "confirmado";
    const parejaGanadora = resultadoConfirmado
      ? getWinnerPareja(partido.resultado!.resultado)
      : null;
    function getHighlightFor(userId: string | null | undefined) {
      if (!resultadoConfirmado || !userId) return null;
      const pareja = getUserPareja(userId, partido);
      if (!pareja || !parejaGanadora) return null;
      return pareja === parejaGanadora ? "win" : "lose";
    }

    return (
  <div
    key={partido._id}
    className="bg-white dark:bg-gray-900 rounded-lg shadow-md mb-6 flex flex-row items-center w-full min-h-[164px] border border-blue-600 dark:border-blue-900 py-4 px-2"
  >
    <div className="flex flex-col justify-center items-center gap-5 w-20">
      <PlayerCircle
        userId={partido.pareja1_jugador1 ?? null}
        partidoId={partido._id}
        slot="pareja1_jugador1"
        isPast={isPast}
        highlight={isPast ? getHighlightFor(partido.pareja1_jugador1) : undefined}
      />
      <PlayerCircle
        userId={partido.pareja1_jugador2 ?? null}
        partidoId={partido._id}
        slot="pareja1_jugador2"
        isPast={isPast}
        highlight={isPast ? getHighlightFor(partido.pareja1_jugador2) : undefined}
      />
    </div>
    <div className="flex-1 flex flex-col justify-center items-center px-2 text-center">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 font-semibold text-lg mb-3 justify-center">
        <MapPin size={18} />
        {partido.localizacion}
      </div>
      <div className="flex justify-center items-center gap-4 text-gray-700 dark:text-gray-200 text-base mb-2">
        <span className="flex items-center gap-1">
          <Calendar size={16} /> {partido.fecha}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} /> {partido.hora}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 justify-center">
        <span>Creado el {formatDateMadrid(partido.created_at)}</span>
        <span>Actualizado el {formatDateMadrid(partido.updated_at)}</span>
      </div>
      {accionesResultado}
    </div>
    <div className="flex flex-col justify-center items-center gap-5 w-20">
      <PlayerCircle
        userId={partido.pareja2_jugador1 ?? null}
        partidoId={partido._id}
        slot="pareja2_jugador1"
        isPast={isPast}
        highlight={isPast ? getHighlightFor(partido.pareja2_jugador1) : undefined}
      />
      <PlayerCircle
        userId={partido.pareja2_jugador2 ?? null}
        partidoId={partido._id}
        slot="pareja2_jugador2"
        isPast={isPast}
        highlight={isPast ? getHighlightFor(partido.pareja2_jugador2) : undefined}
      />
    </div>
  </div>
);
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md mb-6 flex flex-row items-center w-full min-h-[164px] border border-blue-400 py-4 px-2 animate-pulse">
      <div className="flex flex-col justify-center items-center gap-5 w-20">
        <div className="w-12 h-12 rounded-full border-2 border-blue-200 bg-blue-100" />
        <div className="w-12 h-12 rounded-full border-2 border-blue-100 bg-blue-50" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center px-2 text-center gap-2">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-2/6 mb-1" />
        <div className="h-3 bg-gray-100 rounded w-2/6" />
      </div>
      <div className="flex flex-col justify-center items-center gap-5 w-20">
        <div className="w-12 h-12 rounded-full border-2 border-blue-100 bg-blue-50" />
        <div className="w-12 h-12 rounded-full border-2 border-blue-200 bg-blue-100" />
      </div>
    </div>
  );

  const partidosPendientes = partidos.filter(isPartidoFuturo);
  const partidosPasados = partidos
    .filter((p) => isPartidoPasado(p) && isPartidoCompleto(p))
    .sort((a, b) => getPartidoDate(b).getTime() - getPartidoDate(a).getTime());

  return (
  <div className="flex flex-col items-center justify-start gap-4 min-h-screen w-full pb-10">
    <div className="w-full mt-8 px-2">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-lg p-6 text-white w-full">
        <h1 className="text-2xl font-bold mb-2">Mis Partidos</h1>
        <p className="text-blue-100 dark:text-blue-200">
          Aquí puedes ver los partidos a los que te has unido o que has creado
        </p>
      </div>
    </div>
    <div className="w-full px-2 flex flex-col gap-10">
      <div className="flex justify-center gap-5">
        <button
          className={`px-4 py-2 rounded-lg font-semibold shadow ${
            view === "pendientes"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-300 border border-blue-600 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-800"
          } transition-colors`}
          onClick={() => setView("pendientes")}
        >
          Partidos Pendientes
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold shadow ${
            view === "pasados"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-300 border border-blue-600 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-800"
          } transition-colors`}
          onClick={() => setView("pasados")}
        >
          Partidos Pasados
        </button>
      </div>

      <div className="w-full bg-[#fff6] dark:bg-[#111a] rounded-lg shadow-md p-6">
        {view === "pendientes" ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Partidos Pendientes
            </h2>
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : partidosPendientes.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No tienes partidos pendientes.
              </div>
            ) : (
              partidosPendientes.map((partido) => PartidoCard(partido, false))
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Partidos Pasados
            </h2>
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : partidosPasados.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                No tienes partidos pasados completos.
              </div>
            ) : (
              partidosPasados.map((partido) => PartidoCard(partido, true))
            )}
          </>
        )}
      </div>
    </div>

    <ProponerResultadoModal
      show={modal.show && modal.type === "proponer"}
      onClose={() => setModal({ show: false })}
      onSubmit={handleProponerResultadoSubmit}
    />

    <Modal
      show={modal.show && modal.type === "confirmar"}
      title="Confirmar resultado"
      onClose={() => setModal({ show: false })}
      onSubmit={submitConfirmarResultado}
      submitLabel="Confirmar"
    >
      <div className="mb-2">
        ¿Quieres confirmar el siguiente resultado?<br />
        <span className="font-bold text-blue-600 dark:text-blue-300">
          {modal.resultadoActual}
        </span>
      </div>
    </Modal>
    <Modal
      show={modal.show && modal.type === "rechazar"}
      title="Rechazar resultado"
      onClose={() => setModal({ show: false })}
      onSubmit={submitRechazarResultado}
      submitLabel="Rechazar"
    >
      <div className="mb-2">
        ¿Seguro que quieres rechazar el siguiente resultado?<br />
        <span className="font-bold text-red-600 dark:text-red-400">
          {modal.resultadoActual}
        </span>
      </div>
    </Modal>
    <Modal
      show={modal.show && !modal.type}
      title="Aviso"
      onClose={() => setModal({ show: false })}
      onSubmit={undefined}
    >
      <div className="mb-2">
        Ha ocurrido un error o no tienes sesión iniciada.
      </div>
    </Modal>
  </div>
);
};

export default MisPartidos;