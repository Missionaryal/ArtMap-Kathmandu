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
import PlaceDetailPage from "./features/places/PlaceDetailPage";
import ProfilePage from "./features/profile/ProfilePage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import CreatorRoute from "./features/auth/CreatorRoute";
import ForgotPasswordPage from "./features/auth/ForgotPasswordPage";
import CreatorDashboard from "./features/creator/CreatorDashboard";

function AppContent() {
  const location = useLocation();
  const isCreatorPath = location.pathname.startsWith("/creator");

  return (
    <div className="min-h-screen flex flex-col">
      {!isCreatorPath && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />

          {/* Protected user routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Creator-only routes — protected by CreatorRoute */}
          <Route element={<CreatorRoute />}>
            <Route path="/creator" element={<CreatorDashboard />} />
          </Route>
        </Routes>
      </main>
      {!isCreatorPath && <Footer />}
    </div>
  );
}

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
