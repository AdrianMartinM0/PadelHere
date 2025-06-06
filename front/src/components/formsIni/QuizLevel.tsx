import PadelLevelQuiz from "./PadelLevelQuiz"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#ACD3FF] dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto p-4 sm:p-8">
        <PadelLevelQuiz />
      </div>
    </div>
  )
}