// useAuth.js
// A custom hook that gives any component easy access to the authentication context.
// Instead of importing AuthContext and useContext in every file, components
// can just call useAuth() to get the current user, login, logout, etc.
//
// Usage:
//   const { user, login, logout } = useAuth();

import { useContext } from "react";
import { AuthContext } from "../features/auth/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);

  // If this hook is called outside of <AuthProvider>, something is wrong with the component tree
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
