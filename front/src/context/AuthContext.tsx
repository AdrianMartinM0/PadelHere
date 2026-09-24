import { createContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/apiClient";

interface UserData {
  id: string;
  name: string;
  level: number;
  desc: string;
  img_perfil: string | null;
  tel?: number;
  reservas?: string[]; // Array de IDs de reserva
}

interface ClubData {
  id: string;
  name: string;
  tel: number;
  desc: string | null;
  img_perfil: string | null;
  direccion: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  email: string | null;
  userType: string | null;
  userData: UserData | null;
  clubData: ClubData | null;
  reservaIds: string[];
  setReservaIds: React.Dispatch<React.SetStateAction<string[]>>; // <--- TIPADO CORRECTO
  login: (token: string) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUserLevel: (newLevel: number) => void;
  updateClubDesc: (desc: string) => Promise<boolean>;
  updateClubInfo: (info: Partial<ClubData>) => Promise<boolean>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("jwtToken"));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [reservaIds, setReservaIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Función para obtener datos del usuario o club
  const fetchUserData = async (userEmail: string): Promise<UserData | ClubData | null> => {
    try {
      const endpoint = userType === "club" ? "/club/club" : "/usuario/user";
      const data = await apiClient.request<UserData | ClubData>(`${endpoint}?email=${userEmail}`);

      if (userType === "club") {
        return {
          id: data._id,
          name: data.name,
          tel: data.tel,
          desc: data.desc || null,
          img_perfil: data.img_perfil,
          direccion: data.direccion,
        };
      } else {
        setReservaIds(data.reservas || []);
        return {
          id: data._id,
          name: data.name,
          level: data.level,
          desc: data.desc || "",
          img_perfil: data.img_perfil,
          tel: data.tel,
          reservas: data.reservas || [], // Solo los IDs
        };
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setReservaIds([]);
      return null;
    }
  };

  // Refrescar datos del usuario
  const refreshUserData = async () => {
    if (!email || !userType) return;

    const data = await fetchUserData(email);

    if (userType === "club" && data) {
      setClubData(data as ClubData);
    } else if (data) {
      setUserData(data as UserData);
      setReservaIds((data as UserData).reservas || []);
    }
  };

  // Actualizar nivel del usuario
  const updateUserLevel = (newLevel: number) => {
    if (userData) {
      setUserData({
        ...userData,
        level: newLevel,
      });
    }
  };

  // Actualizar descripción del club
  const updateClubDesc = async (desc: string): Promise<boolean> => {
    if (!email || userType !== "club") return false;

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("desc", desc);

      await apiClient.request("/club/update-desc", {
        method: "POST",
        body: formData,
        headers: { 'Content-Type': undefined },
      });

      await refreshUserData();
      return true;
    } catch (error) {
      console.error("Error updating club description:", error);
      return false;
    }
  };

  // Actualizar información del club
  const updateClubInfo = async (info: Partial<ClubData>): Promise<boolean> => {
    if (!email || userType !== "club") return false;

    try {
      const formData = new FormData();
      formData.append("email", email);

      Object.entries(info).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      await apiClient.request("/club/update-info", {
        method: "POST",
        body: formData,
        headers: { 'Content-Type': undefined },
      });

      await refreshUserData();
      return true;
    } catch (error) {
      console.error("Error updating club info:", error);
      return false;
    }
  };

  // Login
  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("jwtToken", newToken);
  };

  // Logout
  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setEmail(null);
    setUserType(null);
    setUserData(null);
    setClubData(null);
    setReservaIds([]);
    localStorage.removeItem("jwtToken");
  };

  // Verificar token cuando cambia
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoggedIn(false);
        setEmail(null);
        setUserType(null);
        setUserData(null);
        setClubData(null);
        setReservaIds([]);
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.request<{ email: string; user_type: string }>(`/usuario/verify-jwt?token=${token}`);

        if (data.email && data.user_type) {
          setIsLoggedIn(true);
          setEmail(data.email);
          setUserType(data.user_type);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Error verificando token:", error);
        logout();
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Redirigir al quiz si el nivel es 0
  useEffect(() => {
    if (userData?.level === 0) navigate("/app/quiz");
  }, [userData, navigate]);

  // Cargar datos del usuario cuando se obtiene el email
  useEffect(() => {
    const loadUserData = async () => {
      if (isLoggedIn && email && userType) {
        const data = await fetchUserData(email);

        if (userType === "club" && data) {
          setClubData(data as ClubData);
          setUserData(null);
          setReservaIds([]);
        } else if (data) {
          setUserData(data as UserData);
          setClubData(null);
          setReservaIds((data as UserData).reservas || []);
        }
      }
    };

    loadUserData();
  }, [isLoggedIn, email, userType]);

  const value: AuthContextType = {
    isLoggedIn,
    token,
    email,
    userType,
    userData,
    clubData,
    reservaIds,
    setReservaIds,
    login,
    logout,
    refreshUserData,
    updateUserLevel,
    updateClubDesc,
    updateClubInfo,
    loading,
  };

  if (!loading)
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};