// AuthContext.jsx
// Provides global authentication state to the entire React app.
// Any component can call useAuth() to get the current user or call login/logout.

import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, getUserInfo } from "../../api/authApi";

// Create the context object — this is what useAuth() reads from
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  // loading is true while we check localStorage on first page load
  const [loading, setLoading] = useState(true);

  // On first load, check if the user was already logged in from a previous session
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        // Restore the user object from localStorage so the page doesn't flash logged-out
        setUserState(JSON.parse(userData));
      } catch {
        // If localStorage data is corrupted, clear it
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Save user to both state and localStorage so it survives page refreshes
  const setUser = (userData) => {
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
    else localStorage.removeItem("user");
    setUserState(userData);
  };

  // Called when the user submits the login form
  const login = async (email, password) => {
    try {
      // Step 1: Get JWT tokens from the backend
      const data = await loginUser(email, password);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      try {
        // Step 2: Fetch the full user profile using the new token
        const userInfo = await getUserInfo();
        const userData = {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          date_joined: userInfo.date_joined,
          profile_picture: userInfo.profile_picture || null,
          is_creator: userInfo.is_creator,
          creator_status: userInfo.creator_status,
          business_name: userInfo.business_name,
          // Used to detect admin users and redirect them to the admin panel
          is_staff: userInfo.is_staff || false,
          is_superuser: userInfo.is_superuser || false,
        };
        setUser(userData);
        return { success: true, user: userData };
      } catch {
        return { success: false, error: "Failed to get user information" };
      }
    } catch (error) {
      // Return the Django error message (e.g. "account under review")
      const detail = error.response?.data?.detail;
      return { success: false, error: detail || "Invalid email or password" };
    }
  };

  // Called when the user submits the registration form
  const register = async (username, email, password, role, extra = {}) => {
    try {
      await registerUser({ username, email, password, role, ...extra });
      return {
        success: true,
        // Show different messages depending on the role
        message:
          role === "creator"
            ? "Account created! Your creator profile is pending approval."
            : "Account created! Please login.",
      };
    } catch (error) {
      // Extract the most relevant error message from the API response
      const errorData = error.response?.data;
      let errorMessage = "Registration failed. Please try again.";
      if (errorData?.username) errorMessage = errorData.username[0];
      else if (errorData?.email) errorMessage = errorData.email[0];
      else if (errorData?.password) errorMessage = errorData.password[0];
      return { success: false, error: errorMessage };
    }
  };

  // Clears all stored tokens and user data, effectively logging the user out
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {/* Don't render children until we've checked localStorage — prevents flash */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
