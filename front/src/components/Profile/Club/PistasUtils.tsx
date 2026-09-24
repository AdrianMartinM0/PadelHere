export function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function toTimeStr(m: number) {
  const x = m % (24 * 60);
  return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`;
}

export type Block = {
  from: number;
  to: number;
  type: "libre" | "break" | "entrenamiento" | "reserva" | "noreservable";
  reservable?: boolean;
};

type Training = { from: string; duration: number };
type Reserva = { day: string; from: number; to: number };

export type DayConfigInput = {
  open: string;
  close: string;
  closed: boolean;
  hasBreak: boolean;
  break: { from: string; to: string };
  trainings?: Training[];
  reservas?: Reserva[];
};

export function splitLibreReubicando(from: number, to: number) {
  const slot = 90;
  const len = to - from;
  const res: { from: number; to: number; reservable: boolean }[] = [];
  if (len === 30 || len === 60) {
    res.push({ from, to, reservable: false });
    return res;
  }
  const resto = len % slot;
  let cursor = from;
  if (resto === 30 || resto === 60) {
    res.push({ from: cursor, to: cursor + resto, reservable: false });
    cursor += resto;
  }
  while (cursor + slot <= to) {
    res.push({ from: cursor, to: cursor + slot, reservable: true });
    cursor += slot;
  }
  return res;
}

export function getNext14Days(): { label: string; date: string }[] {
  const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const today = new Date();
  const result: { label: string; date: string }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    result.push({
      label: daysOfWeek[d.getDay()],
      date: `${yyyy}-${mm}-${dd}`,
    });
  }
  return result;
}

export function getBlocks(cfg: DayConfigInput, date: string): Block[] {
  const open = toMinutes(cfg.open);
  let close = toMinutes(cfg.close);
  if (close <= open) close += 24 * 60;
  const breakFrom = cfg.hasBreak && cfg.break?.from ? toMinutes(cfg.break.from) : null;
  const breakTo = cfg.hasBreak && cfg.break?.to ? toMinutes(cfg.break.to) : null;
  if (breakFrom !== null && breakTo !== null && breakTo <= breakFrom) breakTo += 24 * 60;
  const entrenos = (cfg.trainings || []).map((t: Training) => {
    const from = toMinutes(t.from);
    const to = from + t.duration;
    if (to <= from) to += 24 * 60;
    return { from, to, type: "reserva" as const };
  });
  const reservas = (cfg.reservas || []).filter((r: Reserva) => r.day === date).map((r: Reserva) => ({ from: r.from, to: r.to, type: "reserva" as const }));
  const blocks: { from: number; to: number; type: "libre" | "break" | "entrenamiento" | "reserva" }[] = [];
  if (cfg.hasBreak && breakFrom !== null && breakTo !== null)
    blocks.push({ from: breakFrom, to: breakTo, type: "break" });
  blocks.push(...entrenos);
  blocks.push(...reservas);
  const points = [open, close];
  blocks.forEach((b) => { points.push(b.from, b.to); });
  const sortedPoints = Array.from(new Set(points)).sort((a, b) => a - b);
  const result: Block[] = [];
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const from = sortedPoints[i];
    const to = sortedPoints[i + 1];
    if (from === to) continue;
    let tipo: Block["type"] = "libre";
    for (const b of blocks) {
      if (from >= b.from && to <= b.to) { tipo = b.type; break; }
    }
    if (tipo === "libre") {
      for (const sub of splitLibreReubicando(from, to)) {
        if (sub.reservable) {
          result.push({ from: sub.from, to: sub.to, type: "libre", reservable: true });
        } else {
          result.push({ from: sub.from, to: sub.to, type: "noreservable", reservable: false });
        }
      }
    } else {
      result.push({ from, to, type: tipo });
    }
  }
  return result.filter((b) => b.from < b.to);
}
