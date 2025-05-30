import { getBlocks, Block } from "./PistasUtils";
import SlotBlock from "./SlotBlock";

function isPast(date: string) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const slotDate = new Date(date);
  slotDate.setHours(0,0,0,0);
  return slotDate < today;
}

export default function DayRow({
  dayLabel, date, config, trainings, reservas, closed, onReserve
}:{
  dayLabel: string,
  date: string,
  config: any,
  trainings: any[],
  reservas: any[],
  minStart: number,
  maxEnd: number,
  closed?: boolean,
  onReserve: (date: string, from: number, to: number) => void
}) {
  // trainings ya viene correctamente filtrado (override o global)
  const mergedCfg = { ...config, trainings, reservas };
  const blocks: Block[] = getBlocks(mergedCfg, date);

  const past = isPast(date);

  if (closed) {
    return (
      <div className="flex w-full" style={{marginLeft:80}}>
        <div className="flex flex-col justify-center w-full text-right pr-3 min-w-[120px]" style={{marginLeft:-80}}>
          <div className="text-sm font-medium">
            {dayLabel} <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
        <div className="flex w-full items-center py-2">
          <span className="text-red-500 font-semibold">Día cerrado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full" style={{marginLeft:80}}>
      <div className="flex flex-col justify-center w-full text-right pr-3 min-w-[120px]" style={{marginLeft:-80}}>
        <div className="text-sm font-medium flex flex-col">
          <p>{date}</p>
          <p className="text-xs text-gray-500">{dayLabel}</p>
        </div>
      </div>
      <div className="flex w-full">
        {blocks.map((b: Block, i: number) => (
          <SlotBlock
            key={i}
            from={b.from}
            to={b.to}
            type={b.type}
            reservable={b.reservable}
            disabled={past}
            onReserve={() => onReserve(date, b.from, b.to)}
          />
        ))}
      </div>
    </div>
  );
}