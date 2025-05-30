
function pad(n: number) { return n.toString().padStart(2, "0"); }
function toTimeStr(m: number) { const x = m % (24*60); return `${pad(Math.floor(x/60))}:${pad(x%60)}`; }


// Slot visual adaptativo y reservable
function SlotBlock({from,to,type,onReserve,disabled,reservable}:{from:number,to:number,type:"libre"|"break"|"entrenamiento"|"reserva"|"noreservable",onReserve?:()=>void,disabled?:boolean,reservable?:boolean}) {
  // 45px por cada 30min
  const width = ((to-from)/30)*45;
  let bg = "bg-green-500";
  let label = "";
  let clickable = false;
  if (type==="break") { bg = "bg-gray-400"; label="Descanso"; }
  if (type==="noreservable") { bg = "bg-gray-400"; label="No reservable"; }
  if (type==="entrenamiento") { bg = "bg-red-400"; label="Entrenamiento"; }
  if (type==="reserva") { bg = "bg-red-400"; label="Reservado"; }
  if (type==="libre" && reservable && !disabled) { label="Reservar"; clickable = true; }
  return (
    <button
      className={`h-10 rounded ${bg} text-xs text-white font-medium flex items-center justify-center focus:outline-none ${clickable ? "hover:bg-green-600" : ""}`}
      style={{minWidth:width, maxWidth:width, marginRight:2, cursor: clickable ? "pointer" : "default", opacity: disabled ? 0.5 : 1}}
      title={label}
      disabled={!clickable}
      onClick={clickable ? onReserve : undefined}
    >
      {toTimeStr(from)}-{toTimeStr(to)}
    </button>
  );
}

export default SlotBlock;