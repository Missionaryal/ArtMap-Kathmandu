// App.jsx
// The root of the React application.
// Sets up routing, wraps everything in AuthProvider so all components can
// access the logged-in user, and conditionally shows or hides the Navbar/Footer
// depending on which page is open.

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import HomePage from "./features/home/HomePage";
import ExplorePage from "./features/home/ExplorePage";
import MapPage from "./features/home/MapPage";
import AboutPage from "./features/home/AboutPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ForgotPasswordPage from "./features/auth/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import PlaceDetailPage from "./features/places/PlaceDetailPage";
import ProfilePage from "./features/profile/ProfilePage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import CreatorRoute from "./features/auth/CreatorRoute";
import CreatorDashboard from "./features/creator/CreatorDashboard";

// These paths get no Navbar or Footer — they have their own full-screen layout
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

// AppContent is a separate component so it can use useLocation(),
// which only works inside a <Router> — we can't call it directly in App()
function AppContent() {
  const location = useLocation();

  // The creator dashboard has its own sidebar, so it doesn't need the global Navbar
  const isCreatorPath = location.pathname.startsWith("/creator");

  // Auth pages (login, register, etc.) have their own full-screen layouts
  const isAuthPath =
    AUTH_PATHS.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  // Hide the global Navbar and Footer for both creator and auth pages
  const hideShell = isCreatorPath || isAuthPath;

  return (
    <div className="min-h-screen flex flex-col">
      {!hideShell && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public pages — accessible without logging in */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />

          {/* Auth pages — no Navbar or Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {/* uidb64 and token come from the password reset email link */}
          <Route
            path="/reset-password/:uidb64/:token"
            element={<ResetPasswordPage />}
          />

          {/* Protected — requires any logged-in user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Creator-only — CreatorRoute redirects non-approved users to /profile */}
          <Route element={<CreatorRoute />}>
            <Route path="/creator" element={<CreatorDashboard />} />
          </Route>
        </Routes>
      </main>
      {!hideShell && <Footer />}
    </div>
  );
}

// App wraps everything in AuthProvider (global auth state) and Router (URL handling)
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
