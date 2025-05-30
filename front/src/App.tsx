import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import Footer from "./components/footer/Footer"
import Header from "./components/header/Header"
import Inicio from "./components/Inicio/Inicio"
import Login from "./components/formsIni/Login"
import Register from "./components/formsIni/Register"
import Recover from "./components/formsIni/Recover"
import Porfile from "./components/Profile/Porfile"
import Partidos from "./components/Profile/Partidos"
import Logros from "./components/Profile/Logros"
import Nivel from "./components/Profile/Nivel"
import VerifyPasscode from "./components/formsIni/VerifyPasscode"
import SetNewPassword from "./components/formsIni/SetNewPassword"
import Jugar from "./components/principales/Jugar"
import QuizLevel from "./components/formsIni/QuizLevel"
import { AuthContext } from "./context/AuthContext"
import { useContext } from "react"
import ClubProfile from "./components/Profile/Club/ClubProfile"

function App() {

  const { isLoggedIn, userType } = useContext(AuthContext)!;
  

  return (
    <div className="bg-[#ACD3FF] min-h-screen flex flex-col gap-8 justify-between">
      <Header />
      <div className="container h-full max-w-[1200px] flex items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
          <Routes>
            <Route path="/" element={<Inicio />} />
            {!isLoggedIn? 
            <Route path="sesion/" element={<Outlet />}>
              <Route element={<Outlet />}>
                <Route index element={<Navigate to="login" />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="recover" element={<Recover />} />
                <Route path="verify-passcode" element={<VerifyPasscode />} />
                <Route path="set-new-password" element={<SetNewPassword />} />
              </Route>
            </Route>
            :
            <Route path="app/" element={<Outlet />}>
              <Route path="quiz/" element={<QuizLevel/>} />
              <Route element={<Outlet />}>
                <Route index element={<Navigate to="jugar" />} />
                <Route path="jugar/" element={<Jugar />} />
                {userType === "club"?
                <Route path="profile/" element={<ClubProfile />}/>
                :
                <Route path="profile/" element={<Porfile />}>
                  <Route element={<Outlet />}>
                    <Route index element={<Navigate to="partidos" />} />
                    <Route path="partidos" element={<Partidos />} />
                    <Route path="logros" element={<Logros />} />
                    <Route path="nivel" element={<Nivel />} />
                  </Route>
                </Route>
                }
              </Route>
            </Route>
            }
            {/* <Route path="/jugar" element={<Jugar />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
