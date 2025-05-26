import type React from "react"

import { useState } from "react"
import { Plus, MapPin, Calendar, Clock, Users } from "lucide-react"

const Jugar = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    location: "",
    date: "",
    time: "",
    maxPlayers: 4,
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para crear el partido
    console.log("Crear partido:", { ...formData, maxPlayers: 4 })
    // Resetear formulario y cerrar modal
    setFormData({
      location: "",
      date: "",
      time: "",
      maxPlayers: 4,
      description: "",
    })
    setShowCreateForm(false)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      {/* Sección superior - Crear partido */}
      <div className="w-full mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold mb-2">¿Listo para jugar?</h1>
              <p className="text-blue-100">Crea un nuevo partido o únete a uno existente</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus size={20} />
              Crear Partido
            </button>
          </div>
        </div>
      </div>

      {/* Modal para crear partido */}
      {showCreateForm && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-[#ACD3FF] bg-opacity-50 z-40" onClick={() => setShowCreateForm(false)}></div>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Partido</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreateMatch} className="space-y-4">
                  {/* Ubicación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      Ubicación
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ej: Padel Club Centro"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock size={16} className="inline mr-1" />
                      Hora
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Información adicional sobre el partido..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Crear Partido
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lista de partidos existentes */}
      <div className="w-full max-h-[60vh] bg-[#fff6] rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2 text-center">Partidos Disponibles</h2>

        {/* Ejemplo de partidos con nuevo diseño */}
        <div className="space-y-2">
          {/* Partido 1 */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              {/* Botones izquierda */}
              <div className="flex flex-col gap-2">
                <button className="w-16 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors">
                  Unirse
                </button>
                <button className="w-16 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors">
                  Unirse
                </button>
              </div>

              {/* Información del partido (centro) */}
              <div className="flex-1 text-center px-8">
                <div className="mb-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin size={18} className="text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-800">Padel Club Centro</h3>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span className="font-medium">Viernes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span className="font-medium">18:00</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                  <Users size={16} />
                  <span>2/4 jugadores</span>
                </div>
              </div>

              {/* Botones derecha */}
              <div className="flex flex-col gap-2">
                <button className="w-16 h-12 bg-gray-300 text-gray-500 rounded-lg font-semibold text-sm cursor-not-allowed">
                  Ocupado
                </button>
                <button className="w-16 h-12 bg-gray-300 text-gray-500 rounded-lg font-semibold text-sm cursor-not-allowed">
                  Ocupado
                </button>
              </div>
            </div>
          </div>

          {/* Partido 2 */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              {/* Botones izquierda */}
              <div className="flex flex-col gap-2">
                <button className="w-16 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors">
                  Unirse
                </button>
                <button className="w-16 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors">
                  Unirse
                </button>
              </div>

              {/* Información del partido (centro) */}
              <div className="flex-1 text-center px-8">
                <div className="mb-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin size={18} className="text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-800">Polideportivo Norte</h3>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span className="font-medium">Sábado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span className="font-medium">11:00</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                  <Users size={16} />
                  <span>1/4 jugadores</span>
                </div>
              </div>

              {/* Botones derecha */}
              <div className="flex flex-col gap-2">
                <button className="w-16 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors">
                  Unirse
                </button>
                <button className="w-16 h-12 bg-gray-300 text-gray-500 rounded-lg font-semibold text-sm cursor-not-allowed">
                  Ocupado
                </button>
              </div>
            </div>
          </div>

          {/* Partido 3 - Completo */}
          <div className="bg-white rounded-lg shadow-lg border border-green-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              {/* Botones izquierda */}
              <div className="flex flex-col gap-2">
                <button className="w-16 h-12 bg-green-500 text-white rounded-lg font-semibold text-sm cursor-not-allowed">
                  Lleno
                </button>
                <button className="w-16 h-12 bg-green-500 text-white rounded-lg font-semibold text-sm cursor-not-allowed">
                  Lleno
                </button>
              </div>

              {/* Información del partido (centro) */}
              <div className="flex-1 text-center px-8">
                <div className="mb-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin size={18} className="text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-800">Padel Arena Sur</h3>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span className="font-medium">Domingo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span className="font-medium">17:30</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-green-600 font-semibold">
                  <Users size={16} />
                  <span>¡Partido Completo!</span>
                </div>
              </div>

              {/* Botones derecha */}
              <div className="flex flex-col gap-2">
                <button className="w-16 h-12 bg-green-500 text-white rounded-lg font-semibold text-sm cursor-not-allowed">
                  Lleno
                </button>
                <button className="w-16 h-12 bg-green-500 text-white rounded-lg font-semibold text-sm cursor-not-allowed">
                  Lleno
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estado vacío */}
        {/* Descomenta esto si no hay partidos disponibles
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Users size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 mb-4">No hay partidos disponibles en este momento</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
          >
            Crear el primer partido
          </button>
        </div>
        */}
      </div>
    </div>
  )
}

export default Jugar
