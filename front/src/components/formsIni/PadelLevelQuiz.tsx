import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

interface Question {
  id: string
  question: string
  options: { text: string; points: number }[]
}

const questions: Question[] = [
  {
    id: "experience",
    question: "¿Cuánto tiempo llevas jugando al pádel?",
    options: [
      { text: "Menos de 6 meses", points: 120 },
      { text: "6 meses - 1 año", points: 272 },
      { text: "1-2 años", points: 425 },
      { text: "2-5 años", points: 627 },
      { text: "Más de 5 años", points: 830 },
    ],
  },
  {
    id: "frequency",
    question: "¿Con qué frecuencia juegas?",
    options: [
      { text: "Ocasionalmente (menos de 1 vez al mes)", points: 120 },
      { text: "1-2 veces al mes", points: 272 },
      { text: "1 vez por semana", points: 425 },
      { text: "2-3 veces por semana", points: 627 },
      { text: "Más de 3 veces por semana", points: 830 },
    ],
  },
  {
    id: "forehand",
    question: "¿Cómo evalúas tu golpe de derecha?",
    options: [
      { text: "Muy básico, a menudo fallo", points: 120 },
      { text: "Básico pero consistente", points: 272 },
      { text: "Bueno, con control de dirección", points: 425 },
      { text: "Muy bueno, con potencia y precisión", points: 627 },
      { text: "Excelente, puedo variar efectos", points: 830 },
    ],
  },
  {
    id: "backhand",
    question: "¿Cómo evalúas tu golpe de revés?",
    options: [
      { text: "Muy básico, a menudo fallo", points: 120 },
      { text: "Básico pero consistente", points: 272 },
      { text: "Bueno, con control de dirección", points: 425 },
      { text: "Muy bueno, con potencia y precisión", points: 627 },
      { text: "Excelente, puedo variar efectos", points: 830 },
    ],
  },
  {
    id: "volley",
    question: "¿Qué tal se te dan las voleas?",
    options: [
      { text: "Muy difíciles, evito ir a la red", points: 120 },
      { text: "Básicas, solo golpes simples", points: 272 },
      { text: "Buenas, me defiendo en la red", points: 425 },
      { text: "Muy buenas, controlo bien la red", points: 627 },
      { text: "Excelentes, domino la red", points: 830 },
    ],
  },
  {
    id: "serve",
    question: "¿Cómo es tu saque?",
    options: [
      { text: "Básico, solo meto la bola", points: 120 },
      { text: "Consistente pero sin variación", points: 272 },
      { text: "Bueno, puedo variar la dirección", points: 425 },
      { text: "Muy bueno, con potencia y precisión", points: 627 },
      { text: "Excelente, domino diferentes tipos", points: 830 },
    ],
  },
  {
    id: "tactics",
    question: "¿Cómo es tu conocimiento táctico del juego?",
    options: [
      { text: "Básico, solo juego la bola", points: 120 },
      { text: "Entiendo lo básico", points: 272 },
      { text: "Bueno, sé cuándo atacar/defender", points: 425 },
      { text: "Muy bueno, leo bien el juego", points: 627 },
      { text: "Excelente, anticipo las jugadas", points: 830 },
    ],
  },
  {
    id: "smash",
    question: "¿Qué tal tus remates?", 
    options: [
      { text: "Muy básicos, a menudo fallo", points: 120 },
      { text: "Básicos pero efectivos", points: 272 },
      { text: "Buenos, con buena potencia", points: 425 },
      { text: "Muy buenos, precisos y potentes", points: 627 },
      { text: "Excelentes, punto casi seguro", points: 830 },
    ],
  },
  {
    id: "competition",
    question: "¿Has participado en competiciones?",
    options: [
      { text: "Nunca he competido", points: 120 },
      { text: "Algún torneo social", points: 272 },
      { text: "Torneos locales ocasionalmente", points: 425 },
      { text: "Compito regularmente", points: 627 },
      { text: "Competición federada/alta", points: 830 },
    ],
  },
  {
    id: "fitness",
    question: "¿Cómo es tu condición física para el pádel?",
    options: [
      { text: "Me canso rápido", points: 120 },
      { text: "Aguanto un set completo", points: 272 },
      { text: "Buena resistencia", points: 425 },
      { text: "Muy buena, aguanto partidos largos", points: 627 },
      { text: "Excelente condición física", points: 830 },
    ],
  },
];

const getLevelInfo = (score: number) => {
  const percentage = (score / 9800) * 100

  if (percentage < 25) {
    return {
      level: "Iniciación",
      category: 5,
      color: "bg-gray-500",
      description: "Estás dando tus primeros pasos en el pádel. ¡Disfruta aprendiendo!",
    }
  } else if (percentage < 50) {
    return {
      level: "Principiante",
      category: 4,
      color: "bg-green-500",
      description: "Tienes lo básico. Sigue practicando para mejorar tu técnica.",
    }
  } else if (percentage < 70) {
    return {
      level: "Intermedio Bajo",
      category: 3,
      color: "bg-yellow-500",
      description: "Buen progreso. Enfócate en la consistencia y táctica básica.",
    }
  } else if (percentage < 85) {
    return {
      level: "Intermedio Alto",
      category: 2,
      color: "bg-orange-500",
      description: "Muy buen nivel. Perfecciona tu juego táctico y técnicas avanzadas.",
    }
  } else {
    return {
      level: "Avanzado",
      category: 1,
      color: "bg-red-500",
      description: "Excelente nivel. Eres un jugador muy experimentado.",
    }
  }
}

function PadelLevelQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const navigate = useNavigate()

  // ✅ Obtener todas las funciones necesarias del contexto
  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error("PadelLevelQuiz debe ser usado dentro de un AuthProvider")
  }
  const { email, refreshUserData, updateUserLevel } = authContext

  const handleAnswer = (points: number) => {
    setSelectedOption(points)
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: points,
    }))
  }

  const saveResultsToDatabase = async (totalScore: number) => {
    setIsSaving(true)
    setSaveError(null)

    try {
      // Verificar que tenemos el email del usuario
      if (!email) {
        throw new Error("No se pudo obtener el email del usuario. Por favor, inicia sesión nuevamente.")
      }

      console.log("Enviando datos:", { email, level: totalScore })

      // Crear FormData con email del contexto y totalScore como level
      const formData = new FormData()
      formData.append("email", email)
      formData.append("level", totalScore.toString())

      const response = await fetch("https://padelhere-production.up.railway.app/v1/usuario/update-level", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`)
      }

      const result = await response.json()
      console.log("Level updated:", result)

      // ✅ ACTUALIZAR EL CONTEXTO DESPUÉS DE GUARDAR EXITOSAMENTE

      // 1. Actualizar inmediatamente el nivel en el contexto (optimización UX)
      if (updateUserLevel) {
        updateUserLevel(totalScore)
      }

      // 2. Refrescar todos los datos del usuario desde la base de datos
      if (refreshUserData) {
        await refreshUserData()
      }

      setSaveSuccess(true)


    } catch (error) {
      console.error("Error saving quiz result:", error)
      setSaveError(error instanceof Error ? error.message : "Error desconocido al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedOption(null)
    } else {
      setShowResult(true)

      // Calcular resultados y guardar en la base de datos
      const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0)

      // Guardar en la base de datos
      await saveResultsToDatabase(totalScore)
    }
  }

  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0)
  const levelInfo = getLevelInfo(totalScore)
  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (showResult) {
  return (
    <>
      {/* Overlay transparente que bloquea la interacción */}
      <div className="fixed inset-0 bg-[#ACD3FF] bg-opacity-50 z-40 dark:bg-gray-900 dark:bg-opacity-60"></div>

      {/* Modal de resultados en pantalla completa */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[95vh] overflow-y-auto transition-colors duration-300">
          <div className="p-4 sm:p-6 text-center border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300">¡Evaluación Completada!</h2>

            {/* Estado de guardado */}
            {isSaving && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-700 dark:text-blue-200 font-medium">Guardando resultados y actualizando perfil...</p>
              </div>
            )}

            {saveSuccess && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-200 font-medium">✅ Nivel actualizado correctamente</p>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">Tu perfil se ha actualizado a {totalScore} puntos</p>
              </div>
            )}

            {saveError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-200 font-medium">❌ Error al guardar: {saveError}</p>
                <button
                  onClick={() => saveResultsToDatabase(totalScore)}
                  className="mt-2 text-sm bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-900 text-white px-3 py-1 rounded"
                  disabled={isSaving}
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-3">
                <span
                  className={`inline-block ${levelInfo.color} text-white text-2xl px-6 py-3 rounded-full font-bold`}
                >
                  {levelInfo.level}
                </span>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categoría {levelInfo.category}</p>
              </div>

              <div className="space-y-3">
                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{totalScore} / 10000 puntos</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-600 dark:bg-blue-400 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(totalScore / 9800) * 100}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{levelInfo.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-base">
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Desglose por categorías:</h4>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="flex justify-between">
                    <span>Experiencia:</span>
                    <span className="font-semibold">
                      {(answers.experience || 0) + (answers.frequency || 0) + (answers.competition || 0)} pts
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Técnica:</span>
                    <span className="font-semibold">
                      {(answers.forehand || 0) +
                        (answers.backhand || 0) +
                        (answers.volley || 0) +
                        (answers.serve || 0) +
                        (answers.smash || 0)}{" "}
                      pts
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Táctica:</span>
                    <span className="font-semibold">{answers.tactics || 0} pts</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Físico:</span>
                    <span className="font-semibold">{answers.fitness || 0} pts</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Niveles de referencia:</h4>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm">
                  <p className="flex justify-between">
                    <span>🔴 Avanzado (Cat. 1):</span>
                    <span className="font-semibold">8340-10000 pts</span>
                  </p>
                  <p className="flex justify-between">
                    <span>🟠 Intermedio Alto (Cat. 2):</span>
                    <span className="font-semibold">6860-8339 pts</span>
                  </p>
                  <p className="flex justify-between">
                    <span>🟡 Intermedio Bajo (Cat. 3):</span>
                    <span className="font-semibold">4900-6859 pts</span>
                  </p>
                  <p className="flex justify-between">
                    <span>🟢 Principiante (Cat. 4):</span>
                    <span className="font-semibold">2450-4899 pts</span>
                  </p>
                  <p className="flex justify-between">
                    <span>⚪ Iniciación (Cat. 5):</span>
                    <span className="font-semibold">0-2449 pts</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={() => navigate("/app/jugar", { replace: true })}
                className="bg-blue-600 dark:bg-blue-700 text-white py-3 px-8 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-900 transition-colors font-semibold text-lg"
                disabled={isSaving}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

return (
  <>
    {/* Overlay transparente durante el cuestionario */}
    <div className="fixed inset-0 bg-[#ACD3FF] bg-opacity-30 z-40 dark:bg-gray-900 dark:bg-opacity-40"></div>

    {/* Cuestionario en pantalla completa */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl h-[90vh] flex flex-col transition-colors duration-300">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Evaluación de Nivel de Pádel</h2>
              <span className="text-lg text-gray-500 dark:text-gray-300 font-semibold">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-6 h-full flex flex-col">
            <div className="flex-1 space-y-6">
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                {questions[currentQuestion].question}
              </h3>

              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-900 ${
                      selectedOption === option.points
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-200 dark:ring-blue-900"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option.points}
                      checked={selectedOption === option.points}
                      onChange={() => handleAnswer(option.points)}
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                    <span className="flex-1 text-lg text-gray-900 dark:text-gray-100">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg bg-white dark:bg-gray-800"
              >
                Anterior
              </button>

              <button
                onClick={nextQuestion}
                disabled={selectedOption === null}
                className="px-8 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
              >
                {currentQuestion === questions.length - 1 ? "Finalizar" : "Siguiente"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)
}

export default PadelLevelQuiz
