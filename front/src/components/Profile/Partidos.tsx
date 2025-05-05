

const Partidos = () => {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Partidos Jugados</h2>
      <ul className="divide-y divide-gray-200">
        <li className="py-4 flex justify-between">
          <span className="font-medium text-gray-700">Victoria vs Carlos & Marta</span>
          <span className="text-green-500 font-semibold">Ganado</span>
        </li>
        <li className="py-4 flex justify-between">
          <span className="font-medium text-gray-700">Derrota vs Ana & Luis</span>
          <span className="text-red-500 font-semibold">Perdido</span>
        </li>
        <li className="py-4 flex justify-between">
          <span className="font-medium text-gray-700">Victoria vs Pedro & Laura</span>
          <span className="text-green-500 font-semibold">Ganado</span>
        </li>
      </ul>
    </section>
  )
}

export default Partidos