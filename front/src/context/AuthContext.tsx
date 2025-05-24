import { createContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react";

interface UserData {
  name: string;
  level: number;
  desc: string;
  img_perfil: string | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  email: string | null;
  userType: string | null;
  userData: UserData | null;
  refreshUserData: () => Promise<void>;
  setUserData: (data: UserData | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("jwtToken"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [email, setEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // ✅ Memoizar refreshUserData para evitar recreaciones
  const refreshUserData = useCallback(async () => {
    if (!email) {
      setUserData(null);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/v1/usuario/user?email=${email}`);
      if (!res.ok) throw new Error("Error al obtener los datos del usuario");
      const data = await res.json();
      setUserData({
        name: data.name,
        level: data.level,
        desc: data.desc,
        img_perfil: data.img_perfil,
      });
    } catch (e) {
      setUserData(null);
      console.error(e);
    }
  }, [email]); // ✅ Solo depende de email

  // ✅ Memoizar funciones login y logout
  const login = useCallback((newToken: string) => setToken(newToken), []);
  const logout = useCallback(() => setToken(null), []);

  useEffect(() => {
    console.log("AuthProvider montado - timestamp:", new Date().toISOString());
    
    return () => {
      console.log("AuthProvider desmontado - timestamp:", new Date().toISOString());
    };
  }, []);

  // ✅ Efecto para manejar localStorage y isLoggedIn
  useEffect(() => {
    if (token) {
      localStorage.setItem("jwtToken", token);
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("jwtToken");
      setIsLoggedIn(false);
    }
  }, [token]);

  // ✅ Separar la verificación del JWT en un efecto independiente
  useEffect(() => {
    if (!isLoggedIn || !token) {
      // Limpiar datos cuando no está logueado
      setEmail(null);
      setUserType(null);
      setUserData(null);
      return;
    }

    // Verificar JWT solo cuando está logueado y hay token
    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:8000/v1/usuario/verify-jwt?token=${token}`);
        if (!response.ok) {
          throw new Error("Token invalido");
        }
        const data = await response.json();
        
        if (data.email && data.user_type) {
          setEmail(data.email);
          setUserType(data.user_type);
        } else {
          // Token válido pero sin datos - logout
          setToken(null);
        }
      } catch (error) {
        console.error("Error verificando token:", error);
        // Token inválido - logout
        setToken(null);
      }
    };

    verifyToken();
  }, [isLoggedIn, token]); // ✅ Dependencias claras

  // ✅ Cargar datos del usuario cuando se obtiene el email
  useEffect(() => {
    if (isLoggedIn && email && !userData) {
      refreshUserData();
    }
  }, [email, isLoggedIn, userData, refreshUserData]); // ✅ Incluir refreshUserData en dependencias

  // ✅ Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    isLoggedIn,
    token,
    login,
    logout,
    email,
    userType,
    userData,
    refreshUserData,
    setUserData
  }), [
    isLoggedIn,
    token,
    login,
    logout,
    email,
    userType,
    userData,
    refreshUserData
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};