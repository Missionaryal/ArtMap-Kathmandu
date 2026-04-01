import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, getUserInfo } from "../../api/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      try {
        const userInfo = await getUserInfo();
        const userData = {
          username: userInfo.username,
          email: userInfo.email,
          id: userInfo.id,
          is_creator: userInfo.is_creator,
          creator_status: userInfo.creator_status,
          business_name: userInfo.business_name,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        return { success: false, error: "Failed to get user information" };
      }
    } catch (error) {
      console.error("Login error:", error);
      const detail = error.response?.data?.detail;
      return {
        success: false,
        error: detail || "Invalid email or password",
      };
    }
  };

  const register = async (username, email, password, role, extra = {}) => {
    try {
      await registerUser({ username, email, password, role, ...extra });
      return {
        success: true,
        message:
          role === "creator"
            ? "Account created! Your creator profile is pending approval."
            : "Account created! Please login.",
      };
    } catch (error) {
      console.error("Register error:", error);

      const errorData = error.response?.data;
      let errorMessage = "Registration failed. Please try again.";

      if (errorData?.username) {
        errorMessage = errorData.username[0];
      } else if (errorData?.email) {
        errorMessage = errorData.email[0];
      } else if (errorData?.password) {
        errorMessage = errorData.password[0];
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

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
