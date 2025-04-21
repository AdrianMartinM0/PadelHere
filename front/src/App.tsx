import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Inicio from "./components/Inicio"
import Login from "./components/Login"
import Register from "./components/Register"

function App() {

  return (
    <div className="bg-[#ACD3FF] min-h-screen flex flex-col gap-8 justify-between">
      <Header/>
      <div className="container h-[700px] w-[1200px] mx-auto">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Outlet />}>
                <Route index element={<Inicio />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
      </div>
      <Footer/>
    </div>
  )
}

export default App
