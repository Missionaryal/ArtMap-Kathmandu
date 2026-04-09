// ProtectedRoute.jsx
// A route guard that requires the user to be logged in.
// Used on pages like Profile that should not be accessible to guests.
// If the user is not logged in, they are redirected to the login page.

import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show a spinner while checking if the user is logged in
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if the user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected page if the user is logged in
  return children;
};

export default ProtectedRoute;
