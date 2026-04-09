// Navbar.jsx
// The top navigation bar shown on every page.
// Shows different links depending on whether the user is logged in,
// a creator, or in preview mode.

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/artmap final logo.jpeg";
import { ArrowLeft } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the current URL matches a nav link (to apply the active style)
  const isActive = (path) => location.pathname === path;

  // Preview mode is when a creator views their place page as a visitor would.
  // In this mode, we show a "Back to Dashboard" link instead of the normal nav.
  const isPreview =
    new URLSearchParams(location.search).get("preview") === "true";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Only approved creators get the Dashboard link — pending creators see the Profile page
  const isApprovedCreator =
    user?.is_creator && user?.creator_status === "approved";

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          {/* Logo — clicking takes you to the home page */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <img
              src={logo}
              alt="ArtMap"
              className="h-12 w-12 object-contain group-hover:scale-105 transition-transform mix-blend-multiply"
            />
            <span className="font-serif font-bold text-xl text-stone-900 hidden sm:block">
              ArtMap
            </span>
          </Link>

          {/* Main navigation links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { to: "/", label: "Home" },
              { to: "/explore", label: "Explore" },
              { to: "/map", label: "Map" },
              { to: "/about", label: "About" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${
                  isActive(to)
                    ? "text-gold-500"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side — changes based on login state and role */}
          <div className="flex items-center gap-4">
            {/* Preview mode — creator is viewing their place as a visitor */}
            {isPreview && user ? (
              <Link
                to="/creator"
                className="flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            ) : user ? (
              <>
                {/* Approved creator — show Dashboard link only */}
                {isApprovedCreator ? (
                  <Link
                    to="/creator"
                    className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  // Regular user or pending creator — show Profile + Logout
                  <>
                    <Link
                      to="/profile"
                      className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-stone-500 hover:text-gold-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              // Not logged in — show Sign In and Get Started buttons
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gold-500 hover:bg-gold-600 rounded-lg transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
