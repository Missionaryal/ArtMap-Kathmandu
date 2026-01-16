import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getMe } from "@/api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userInfo) => {
    const data = await apiRegister(userInfo);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const data = await getMe();
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
