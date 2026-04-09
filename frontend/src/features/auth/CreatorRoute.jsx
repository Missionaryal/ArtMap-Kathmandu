// CreatorRoute.jsx
// A route guard that only allows approved creators to access the creator dashboard.
// If the user is not a creator or not yet approved, they are redirected to their profile page.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function CreatorRoute() {
  const { user, loading } = useAuth();

  // Show a spinner while checking if the user is logged in
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  // Redirect if the user is not logged in, not a creator, or pending/rejected
  if (!user || !user.is_creator || user.creator_status !== "approved") {
    return <Navigate to="/profile" replace />;
  }

  // Render the nested route (creator dashboard pages)
  return <Outlet />;
}
