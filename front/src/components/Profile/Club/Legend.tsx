export default function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-sm mb-4">
      <span className="flex items-center gap-1">
        <span className="w-4 h-4 bg-green-500 rounded"></span>
        <span className="text-gray-700 dark:text-gray-100">Libre</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="w-4 h-4 bg-red-400 rounded"></span>
        <span className="text-gray-700 dark:text-gray-100">Ocupado</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="w-4 h-4 bg-gray-400 rounded"></span>
        <span className="text-gray-700 dark:text-gray-100">No reservable</span>
      </span>
    </div>
  );
}