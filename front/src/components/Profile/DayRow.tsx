import { getBlocks, Block } from "./PistasUtils";
import SlotBlock from "./SlotBlock";

export default function DayRow({
  day, config, trainings, reservas, minStart, maxEnd, onReserve
}:{
  day: string,
  config: any,
  trainings: any[],
  reservas: any[],
  minStart: number,
  maxEnd: number,
  onReserve: (day: string, from: number, to: number) => void
}) {
  const mergedCfg = { ...config, trainings, reservas };
  const blocks: Block[] = getBlocks(mergedCfg, day);
  const totalMinutes = maxEnd - minStart;

  return (
    <div className="flex w-full" style={{marginLeft:80}}>
      <div className="flex flex-col justify-center w-full text-right pr-3 min-w-[80px]" style={{marginLeft:-80}}>
        <div className="text-sm font-medium">{day}</div>
      </div>
      <div
        className="flex w-full"
        style={{
          gridTemplateColumns: blocks.map((b: Block) =>
            `${((b.to - b.from) / totalMinutes) * 100}%`
          ).join(' ')
        }}
      >
        {blocks.map((b: Block, i: number) => (
          <SlotBlock key={i}
            from={b.from}
            to={b.to}
            type={b.type}
            reservable={b.reservable}
            onReserve={() => onReserve(day, b.from, b.to)}
          />
        ))}
      </div>
    </div>
  );
}