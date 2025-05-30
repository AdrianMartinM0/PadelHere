export function pad(n: number) { 
  return n.toString().padStart(2, "0"); 
}

export function toMinutes(t: string) { 
  const [h, m] = t.split(":").map(Number); 
  return h*60+m; 
}

export function toTimeStr(m: number) { 
  const x = m % (24*60); 
  return `${pad(Math.floor(x/60))}:${pad(x%60)}`; 
}

export type Block = {
  from: number;
  to: number;
  type: "libre" | "break" | "entrenamiento" | "reserva" | "noreservable";
  reservable?: boolean;
};

export function splitLibreReubicando(from: number, to: number) {
  const slot = 90; // minutos
  let len = to - from;
  let res: {from: number, to: number, reservable: boolean}[] = [];
  if (len === 30 || len === 60) {
    res.push({from, to, reservable: false});
    return res;
  }
  let resto = len % slot;
  let cursor = from;
  if (resto === 30 || resto === 60) {
    res.push({from: cursor, to: cursor + resto, reservable: false});
    cursor += resto;
  }
  while (cursor + slot <= to) {
    res.push({from: cursor, to: cursor + slot, reservable: true});
    cursor += slot;
  }
  return res;
}

export function getNext14Days(): { label: string, date: string }[] {
  const daysOfWeek = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const today = new Date();
  let result = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = (d.getMonth()+1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    result.push({
      label: daysOfWeek[d.getDay()],
      date: `${yyyy}-${mm}-${dd}`,
    });
  }
  return result;
}

export function getBlocks(cfg: any, date: string): Block[] {
  const open = toMinutes(cfg.open);
  let close = toMinutes(cfg.close);
  if (close <= open) close += 24*60;
  let breakFrom = cfg.hasBreak && cfg.break?.from ? toMinutes(cfg.break.from) : null;
  let breakTo = cfg.hasBreak && cfg.break?.to ? toMinutes(cfg.break.to) : null;
  if (breakFrom !== null && breakTo !== null && breakTo <= breakFrom) breakTo += 24*60;
  let entrenos = (cfg.trainings || []).map((t: any) => {
    let from = toMinutes(t.from), to = from + t.duration;
    if (to <= from) to += 24*60;
    return {from, to, type: "reserva" as const};
  });
  let reservas = (cfg.reservas || []).filter((r: any) => r.day === date).map((r: any) => ({from: r.from, to: r.to, type: "reserva" as const}));
  let blocks: {from:number, to:number, type:"libre"|"break"|"entrenamiento"|"reserva"}[] = [];
  if (cfg.hasBreak && breakFrom !== null && breakTo !== null)
    blocks.push({from: breakFrom, to: breakTo, type: "break"});
  blocks.push(...entrenos);
  blocks.push(...reservas);
  let points = [open, close];
  blocks.forEach(b=>{ points.push(b.from, b.to); });
  points = Array.from(new Set(points)).sort((a,b)=>a-b);
  let result: Block[] = [];
  for(let i=0;i<points.length-1;i++) {
    let from = points[i], to = points[i+1];
    if (from === to) continue;
    let tipo: Block["type"] = "libre";
    for (let b of blocks) {
      if (from >= b.from && to <= b.to) { tipo = b.type; break; }
    }
    if (tipo === "libre") {
      for (const sub of splitLibreReubicando(from, to)) {
        if (sub.reservable) {
          result.push({from: sub.from, to: sub.to, type: "libre", reservable: true});
        } else {
          result.push({from: sub.from, to: sub.to, type: "noreservable", reservable: false});
        }
      }
    } else {
      result.push({from, to, type: tipo});
    }
  }
  return result.filter(b=>b.from<b.to);
}
