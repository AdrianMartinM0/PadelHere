import { createContext, useEffect, useState, type ReactNode } from "react"

interface UserData {
  name: string
  level: number
  desc: string
  img_perfil: string | null
}

interface AuthContextType {
  // Estados principales
  isLoggedIn: boolean
  token: string | null
  email: string | null
  userType: string | null
  userData: UserData | null

  // Funciones
  login: (token: string) => void
  logout: () => void
  refreshUserData: () => Promise<void>
  updateUserLevel: (newLevel: number) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Estados básicos
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("jwtToken"))
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Función para obtener datos del usuario
  const fetchUserData = async (userEmail: string): Promise<UserData | null> => {
    try {
      const response = await fetch(`http://localhost:8000/v1/usuario/user?email=${userEmail}`)
      if (!response.ok) {
        throw new Error("Error al obtener datos del usuario")
      }
      const data = await response.json()
      return {
        name: data.name,
        level: data.level,
        desc: data.desc,
        img_perfil: data.img_perfil,
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  // Función para refrescar datos del usuario
  const refreshUserData = async () => {
    if (!email) return

    const newUserData = await fetchUserData(email)
    setUserData(newUserData)
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

  // Cargar datos del usuario cuando se obtiene el email
  useEffect(() => {
    const loadUserData = async () => {
      if (isLoggedIn && email && !userData) {
        const newUserData = await fetchUserData(email)
        setUserData(newUserData)
      }
    }

    loadUserData()
  }, [isLoggedIn, email])

  const value: AuthContextType = {
    isLoggedIn,
    token,
    email,
    userType,
    userData,
    login,
    logout,
    refreshUserData,
    updateUserLevel,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
