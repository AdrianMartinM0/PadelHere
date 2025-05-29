export default function Legend() {
  return (
    <div className="flex gap-4 text-sm mb-4">
      <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded"></span>Libre</span>
      <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-400 rounded"></span>Ocupado</span>
      <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-400 rounded"></span>No reservable</span>
    </div>
  );
}