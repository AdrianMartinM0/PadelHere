function pad(n: number) { return n.toString().padStart(2, "0"); }
function toMinutes(t: string) { const [h, m] = t.split(":").map(Number); return h*60+m; }

// Regla de horas visual solo de apertura a cierre
function TimeRuler({from,to}:{from:string,to:string}) {
  const start = toMinutes(from), end = toMinutes(to);
  let marks = [];
  for (let t = start; t <= end; t += 30) {
    const label = t%60===0 ? `${pad(Math.floor((t/60)%24))}:00` : "";
    marks.push(
      <div key={t} style={{minWidth:"45px",borderLeft:"1px solid #ccc",height:label?"20px":"10px",position:"relative"}}>
        {label && <span style={{position:"absolute",top:"20px",left:"-10px",fontSize:"10px"}}>{label}</span>}
        {!label && <span style={{position:"absolute",top:"12px",left:"-2px",fontSize:"8px"}}>|</span>}
      </div>
    );
  }
  return (
    <div className="flex w-full mb-4 ml-20">
      {marks}
    </div>
  );
}

export default TimeRuler;