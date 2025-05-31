import { createContext, useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"

// Interfaces para los diferentes tipos de usuarios
interface UserData {
  name: string
  level: number
  desc: string
  img_perfil: string | null
}

interface ClubData {
  id: string
  name: string
  tel: number
  desc: string | null
  img_perfil: string | null
  direccion: string
}

interface AuthContextType {
  // Estados principales
  isLoggedIn: boolean
  token: string | null
  email: string | null
  userType: string | null
  userData: UserData | null
  clubData: ClubData | null

  // Funciones
  login: (token: string) => void
  logout: () => void
  refreshUserData: () => Promise<void>
  updateUserLevel: (newLevel: number) => void
  updateClubDesc: (desc: string) => Promise<boolean>
  updateClubInfo: (info: Partial<ClubData>) => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Estados básicos
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("jwtToken"))
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [clubData, setClubData] = useState<ClubData | null>(null)
  const navigate = useNavigate()

  // Función para obtener datos del usuario o club
  const fetchUserData = async (userEmail: string): Promise<UserData | ClubData | null> => {
    try {
      const endpoint = userType === "club" ? "club/club" : "usuario/user"
      const response = await fetch(`http://localhost:8000/v1/${endpoint}?email=${userEmail}`)

      if (!response.ok) {
        throw new Error("Error al obtener datos del usuario")
      }

      const data = await response.json()

      if (userType === "club") {
        return {
          id: data._id,
          name: data.name,
          tel: data.tel,
          desc: data.desc || null,
          img_perfil: data.img_perfil,
          direccion: data.direccion,
        }
      } else {
        return {
          name: data.name,
          level: data.level,
          desc: data.desc || "",
          img_perfil: data.img_perfil,
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  // Función para refrescar datos del usuario
  const refreshUserData = async () => {
    if (!email || !userType) return

    const data = await fetchUserData(email)

    if (userType === "club" && data) {
      setClubData(data as ClubData)
    } else if (data) {
      setUserData(data as UserData)
    }
  }

  // Función para actualizar solo el nivel (optimización)
  const updateUserLevel = (newLevel: number) => {
    if (userData) {
      setUserData({
        ...userData,
        level: newLevel,
      })
    }
  }

  // Función para actualizar la descripción del club
  const updateClubDesc = async (desc: string): Promise<boolean> => {
    if (!email || userType !== "club") return false

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("desc", desc)

      const response = await fetch("http://localhost:8000/v1/club/update-desc", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("No se pudo actualizar la descripción")

      await refreshUserData()
      return true
    } catch (error) {
      console.error("Error updating club description:", error)
      return false
    }
  }

  // Función para actualizar información del club
  const updateClubInfo = async (info: Partial<ClubData>): Promise<boolean> => {
    if (!email || userType !== "club") return false

    try {
      const formData = new FormData()
      formData.append("email", email)

      // Añadir solo los campos que se están actualizando
      Object.entries(info).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      const response = await fetch("http://localhost:8000/v1/club/update-info", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("No se pudo actualizar la información")

      await refreshUserData()
      return true
    } catch (error) {
      console.error("Error updating club info:", error)
      return false
    }
  }

  // Función de login
  const login = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem("jwtToken", newToken)
  }

  // Función de logout
  const logout = () => {
    setToken(null)
    setIsLoggedIn(false)
    setEmail(null)
    setUserType(null)
    setUserData(null)
    setClubData(null)
    localStorage.removeItem("jwtToken")
  }

  // Verificar token cuando cambia
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoggedIn(false)
        setEmail(null)
        setUserType(null)
        setUserData(null)
        setClubData(null)
        return
      }

      try {
        const response = await fetch(`http://localhost:8000/v1/usuario/verify-jwt?token=${token}`)

        if (!response.ok) {
          throw new Error("Token inválido")
        }

        const data = await response.json()

        if (data.email && data.user_type) {
          setIsLoggedIn(true)
          setEmail(data.email)
          setUserType(data.user_type)
        } else {
          logout()
        }
      } catch (error) {
        console.error("Error verificando token:", error)
        logout()
      }
    }

    verifyToken()
  }, [token])

  // Redirigir al quiz si el nivel es 0
  useEffect(() => {
    if (userData?.level === 0) navigate("/app/quiz")
  }, [userData, navigate])

  // Cargar datos del usuario cuando se obtiene el email
  useEffect(() => {
    const loadUserData = async () => {
      if (isLoggedIn && email && userType) {
        const data = await fetchUserData(email)

        if (userType === "club" && data) {
          setClubData(data as ClubData)
          setUserData(null)
        } else if (data) {
          setUserData(data as UserData)
          setClubData(null)
        }
      }
    }

    loadUserData()
  }, [isLoggedIn, email, userType])

  const value: AuthContextType = {
    isLoggedIn,
    token,
    email,
    userType,
    userData,
    clubData,
    login,
    logout,
    refreshUserData,
    updateUserLevel,
    updateClubDesc,
    updateClubInfo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
