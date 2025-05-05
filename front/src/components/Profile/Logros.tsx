

const Logros = () => {
  return (
     <section className="p-6">
     <h2 className="text-2xl font-bold text-gray-800 mb-4">Logros / Torneos</h2>
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div className="bg-green-100 p-4 rounded-lg text-center">
         <h3 className="font-semibold text-green-700">🏆 Torneo Verano 2024</h3>
         <p className="text-green-600 text-sm">Campeón</p>
       </div>
       <div className="bg-yellow-100 p-4 rounded-lg text-center">
         <h3 className="font-semibold text-yellow-700">🥈 Torneo de Invierno</h3>
         <p className="text-yellow-600 text-sm">Finalista</p>
       </div>
     </div>
   </section>
  )
}

export default Logros