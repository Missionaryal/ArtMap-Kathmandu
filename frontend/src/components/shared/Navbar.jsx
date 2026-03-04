import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-14 w-14 flex items-center justify-center">
              <img
                src={logo}
                alt="ArtMap Logo"
                className="h-full w-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/"
              className="text-base text-stone-700 hover:text-gold-400 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/explore"
              className="text-base text-stone-700 hover:text-gold-400 transition-colors font-medium"
            >
              Explore
            </Link>
            <Link
              to="/map"
              className="text-base text-stone-700 hover:text-gold-400 transition-colors font-medium"
            >
              Map
            </Link>
            <Link
              to="/about"
              className="text-base text-stone-700 hover:text-gold-400 transition-colors font-medium"
            >
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-base text-stone-700">
                  Hello,{" "}
                  <span className="font-semibold text-stone-900">
                    {user.name}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="px-5 py-2.5 text-base text-stone-700 hover:text-stone-900 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-base text-stone-700 hover:text-stone-900 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-7 py-3 text-base text-white bg-gold-400 hover:bg-gold-500 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
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
