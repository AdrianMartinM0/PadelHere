import { BrowserRouter, Route, Routes } from "react-router-dom"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Inicio from "./components/Inicio"

function App() {

  return (
    <div className="bg-[#ACD3FF] min-h-screen flex flex-col gap-8 justify-between">
      <Header/>
      <div className="container h-[700px] m-auto">
          <BrowserRouter>
            <Routes>
              <Route path={'/'} element={<Inicio/>}/>
            </Routes>
          </BrowserRouter>
      </div>
      <Footer/>
    </div>
  )
}

export default App
