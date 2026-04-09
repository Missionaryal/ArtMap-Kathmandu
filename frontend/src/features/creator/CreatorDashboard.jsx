// CreatorDashboard.jsx
// The main creator dashboard layout — a full-screen app with a collapsible sidebar
// and a content area that renders whichever section is currently active.
// Only accessible to approved creators (enforced by CreatorRoute.jsx).

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Image,
  MessageSquare,
  Camera,
  BarChart3,
  Settings,
  ChevronLeft,
  Eye,
  CheckCircle,
  Calendar,
  User,
  LogOut,
} from "lucide-react";
import logo from "../../assets/artmap final logo.jpeg";
import { getCreatorProfile, getCreatorPlaces } from "../../api/creatorApi";
import { useAuth } from "../../hooks/useAuth";

// Import all dashboard section components
import Overview from "./sections/Overview";
import PlaceDetails from "./sections/PlaceDetails";
import Gallery from "./sections/Gallery";
import Reviews from "./sections/Reviews";
import TaggedPosts from "./sections/TaggedPosts";
import Analytics from "./sections/Analytics";
import SettingsSection from "./sections/SettingsSection";
import Events from "./sections/Events";
import MyProfile from "./sections/MyProfile";

// Sidebar navigation items — id matches the switch case in renderSection()
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: User },
  { id: "details", label: "Place Details", icon: MapPin },
  { id: "events", label: "Events", icon: Calendar },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "tagged", label: "Tagged Posts", icon: Camera },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  // The sidebar can be collapsed to icons-only to give more space to the content
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [creatorData, setCreatorData] = useState(null);
  // placeId is needed for the "View Public Page" button
  const [placeId, setPlaceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profile, places] = await Promise.all([
        getCreatorProfile(),
        getCreatorPlaces(),
      ]);
      setCreatorData({
        name: profile.business_name,
        category: profile.category,
        verified: profile.status === "approved",
        // First letter of business name used as the avatar initial in the header
        avatar: profile.business_name?.[0]?.toUpperCase() || "C",
      });
      if (places.length > 0) setPlaceId(places[0].id);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Opens the public place page in a new tab with ?preview=true
  // The Navbar detects this param and shows "Back to Dashboard" instead of normal nav
  const handleViewPublicPage = () => {
    if (placeId) {
      window.open(`/places/${placeId}?preview=true`, "_blank");
    } else {
      alert("Create your place first to view the public page.");
    }
  };

  const handleSectionChange = async (sectionId) => {
    setActiveSection(sectionId);
    // When switching to Place Details, refresh the placeId in case the creator just created their place
    if (sectionId !== "details") return;
    try {
      const places = await getCreatorPlaces();
      if (places.length > 0) setPlaceId(places[0].id);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Render the correct section component based on the active nav item
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <Overview />;
      case "profile":
        return <MyProfile />;
      case "details":
        return <PlaceDetails onPlaceCreated={(id) => setPlaceId(id)} />;
      case "gallery":
        return <Gallery />;
      case "events":
        return <Events />;
      case "reviews":
        return <Reviews />;
      case "tagged":
        return <TaggedPosts />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <SettingsSection />;
      default:
        return <Overview />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? "w-16" : "w-56"} transition-all duration-300 bg-white border-r border-stone-200 flex flex-col sticky top-0 h-screen flex-shrink-0`}
      >
        {/* Logo — clicking navigates to the main site */}
        <div className="p-4 border-b border-stone-200">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="ArtMap"
              className="h-10 w-10 object-contain flex-shrink-0 group-hover:scale-105 transition-transform mix-blend-multiply"
            />
            {!sidebarCollapsed && (
              <span className="font-serif font-bold text-stone-900 text-lg">
                ArtMap
              </span>
            )}
          </div>
        </div>

        {/* Verified Creator badge — only shown when sidebar is expanded */}
        {!sidebarCollapsed && creatorData?.verified && (
          <div className="mx-3 mt-3 px-3 py-2 bg-gold-50 border border-gold-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gold-600 flex-shrink-0" />
            <span className="text-xs font-medium text-gold-600">
              Verified Creator
            </span>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => handleSectionChange(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive ? "bg-gold-100 text-gold-700 font-medium" : "text-stone-600 hover:bg-stone-100"}`}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom — Logout and collapse toggle */}
        <div className="p-3 border-t border-stone-200 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            {/* Arrow rotates 180° when sidebar is collapsed */}
            <ChevronLeft
              className={`w-[18px] h-[18px] flex-shrink-0 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
            />
            {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header — shows the creator's name and a "View Public Page" button */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-stone-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-gold-600">
                  {creatorData?.avatar}
                </span>
              </div>
              <div>
                <h2 className="font-medium text-stone-900 leading-tight">
                  {creatorData?.name}
                </h2>
                <p className="text-xs text-stone-500 capitalize">
                  {creatorData?.category?.replace("_", " ")}
                </p>
              </div>
            </div>
            <button
              onClick={handleViewPublicPage}
              className="flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              <span className="font-medium">View Public Page</span>
            </button>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-5xl">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
}
