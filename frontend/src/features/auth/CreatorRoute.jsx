import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function CreatorRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  // Redirect if not a creator or not approved yet
  if (!user || !user.is_creator || user.creator_status !== "approved") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
