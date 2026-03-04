import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../../api/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);

      // Store tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Create user object from email
      const userData = {
        email: email,
        name: email.split("@")[0], // Temporary until we get user data from backend
      };
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const data = await registerUser(name, email, password);

      // If register returns tokens directly
      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        const userData = { name, email };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }

      // If register doesn't return tokens, user needs to login
      return {
        success: true,
        message: "Account created! Please login.",
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error:
          error.response?.data?.email?.[0] ||
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
