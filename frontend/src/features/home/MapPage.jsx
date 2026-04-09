// MapPage.jsx
// Full-screen interactive map of all ArtMap places using React Leaflet + OpenStreetMap.
// Features:
// - Sidebar with list/grid toggle, sorted by distance from user or searched area
// - Category filter pills in the top bar
// - "Near Me" button — requests the browser's GPS location
// - Area search — if the query doesn't match a place name, it geocodes the text
//   using OpenStreetMap's Nominatim API and flies the map to that neighbourhood
// - Custom teardrop pins coloured by category, selected pin is enlarged
// - Rich popups with image, hours, phone, and "View Details" / "Directions" buttons
// - Deep-link support: /map?placeId=5 flies to that place on load

import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Star,
  Search,
  X,
  Navigation,
  List,
  Grid3x3,
} from "lucide-react";
import { getAllPlaces } from "../../api/placesApi";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix the default Leaflet marker icon broken by Webpack/Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Category colours for map pins and sidebar badges
const CATEGORY_CONFIG = {
  gallery: { color: "#C9A961", label: "Gallery" },
  museum: { color: "#7C6E5A", label: "Museum" },
  studio: { color: "#A67C52", label: "Studio" },
  workshop: { color: "#8B7355", label: "Workshop" },
  cafe: { color: "#D97706", label: "Cafe" },
  thangka: { color: "#B45309", label: "Thangka" },
  pottery: { color: "#92400E", label: "Pottery" },
  weaving: { color: "#78350F", label: "Weaving" },
  sculpture: { color: "#6B4226", label: "Sculpture" },
  photography: { color: "#57534E", label: "Photography" },
};

const KATHMANDU_CENTER = [27.7172, 85.324];

// Haversine formula — calculates straight-line distance between two GPS coordinates in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Creates a custom teardrop pin icon — white background with coloured border.
// Selected pins are larger to make the active place obvious.
function createPinIcon(color, isSelected = false) {
  const size = isSelected ? 38 : 30;
  const border = isSelected ? 4 : 3;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px; height:${size}px;
        background:white;
        border:${border}px solid ${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.35), 0 0 0 ${isSelected ? 3 : 0}px ${color}55;
        transition:all 0.2s;
      ">
        <div style="position:absolute;inset:4px;background:${color};border-radius:50% 50% 50% 0;opacity:0.7;"></div>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size - 4],
  });
}

// Blue pulsing dot for the user's GPS location
const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:18px; height:18px;
    background:#2563EB;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 5px rgba(37,99,235,0.25), 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Inner component that calls map.flyTo() — must live inside <MapContainer>
function FlyTo({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom || 15, { duration: 1.2 });
  }, [position]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Deep-link params — e.g. /map?placeId=5&lat=27.72&lng=85.32&name=Siddhartha
  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");
  const urlPlaceId = searchParams.get("placeId");
  const urlPlaceName = searchParams.get("name");

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [flyTo, setFlyTo] = useState(null);
  // Set when the user searches for an area like "Baneshwor" — used as the distance origin
  const [areaSearchCenter, setAreaSearchCenter] = useState(null);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const sidebarRef = useRef();

  useEffect(() => {
    fetchPlaces();
    requestUserLocation();
  }, []);

  const fetchPlaces = async () => {
    try {
      const data = await getAllPlaces();
      setPlaces(data);
      // If a placeId was passed in the URL, fly to that place immediately
      if (urlPlaceId) {
        const target = data.find((p) => String(p.id) === String(urlPlaceId));
        if (target) {
          setSelectedPlace(target);
          setFlyTo([target.latitude, target.longitude]);
        } else if (urlLat && urlLng) {
          setFlyTo([parseFloat(urlLat), parseFloat(urlLng)]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestUserLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationLoading(false);
        // Auto-fly to user's location only if no URL params were provided
        if (!urlPlaceId && !urlLat) setFlyTo([loc.lat, loc.lng]);
      },
      () => {
        setLocationDenied(true);
        setLocationLoading(false);
      },
      { timeout: 8000 },
    );
  };

  // If the search query doesn't match any place names, treat it as a neighbourhood
  // name and geocode it using OpenStreetMap's free Nominatim API
  const handleAreaSearch = async () => {
    if (!searchQuery.trim()) return;
    const matchesPlace = places.some((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (matchesPlace) return; // normal text filter handles it

    setIsSearchingArea(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ", Kathmandu, Nepal")}&format=json&limit=1`,
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setAreaSearchCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setFlyTo([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingArea(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleAreaSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setAreaSearchCenter(null);
  };

  // Sort places by distance from the user's GPS or the area search center
  const distanceOrigin = areaSearchCenter || userLocation;
  const placesWithDistance = places
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      ...p,
      distance: distanceOrigin
        ? getDistance(
            distanceOrigin.lat,
            distanceOrigin.lng,
            p.latitude,
            p.longitude,
          )
        : null,
    }))
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null)
        return a.distance - b.distance;
      return 0;
    });

  const categoryCounts = placesWithDistance.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const filteredPlaces = placesWithDistance.filter((p) => {
    const matchCat =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location &&
        p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setFlyTo([place.latitude, place.longitude]);
  };

  // Build filter buttons — only show categories that have at least one place
  const categories = [
    { value: "all", label: "All", count: placesWithDistance.length },
    ...Object.entries(CATEGORY_CONFIG).map(([value, { label }]) => ({
      value,
      label,
      count: categoryCounts[value] || 0,
    })),
  ].filter((c) => c.value === "all" || c.count > 0);

  const initialCenter =
    urlLat && urlLng
      ? [parseFloat(urlLat), parseFloat(urlLng)]
      : KATHMANDU_CENTER;

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Top bar — search, category filters, Near Me button */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-lg font-serif font-bold text-stone-900">
              ArtMap Kathmandu
              {/* Show the place name in the title if navigated here from a place page */}
              {urlPlaceName && (
                <span className="text-gold-500 text-base font-normal ml-2">
                  → {decodeURIComponent(urlPlaceName)}
                </span>
              )}
            </h1>
            <p className="text-xs text-stone-500">
              {filteredPlaces.length} art space
              {filteredPlaces.length !== 1 ? "s" : ""}
              {distanceOrigin ? " · sorted by distance" : ""}
              {areaSearchCenter ? ` · near "${searchQuery}"` : ""}
            </p>
          </div>

          {/* Search — press Enter or click Go to geocode area names */}
          <div className="flex-1 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search places or areas (e.g. Baneshwor)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-16 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-stone-400 hover:text-stone-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleAreaSearch}
                disabled={isSearchingArea}
                className="px-2 py-0.5 bg-gold-400 text-white rounded text-xs font-medium hover:bg-gold-500 disabled:opacity-50"
              >
                {isSearchingArea ? "..." : "Go"}
              </button>
            </div>
          </div>

          {/* Category filter buttons */}
          <div className="flex gap-1.5 overflow-x-auto flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? "bg-gold-400 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Near Me — requests GPS and flies the map to the user */}
          <button
            onClick={requestUserLocation}
            disabled={locationLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
              userLocation
                ? "bg-blue-100 text-blue-700"
                : locationDenied
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            {locationLoading ? "Locating..." : "Near Me"}
          </button>
        </div>
      </div>

      {/* Main content — sidebar + map side by side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-stone-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-stone-900 text-sm">
                Nearby Places
              </p>
              <p className="text-xs text-stone-500">
                {filteredPlaces.length} art spaces found
                {locationDenied && !areaSearchCenter && (
                  <span className="text-stone-400">
                    {" "}
                    · enable location for distance
                  </span>
                )}
              </p>
            </div>
            {/* Toggle between list and grid view in the sidebar */}
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-gold-100 text-gold-600" : "text-stone-400 hover:bg-stone-100"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-gold-100 text-gold-600" : "text-stone-400 hover:bg-stone-100"}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" ref={sidebarRef}>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-400" />
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-stone-400">
                <MapPin className="w-8 h-8 mb-2" />
                <p className="text-sm">No places found</p>
              </div>
            ) : viewMode === "list" ? (
              // List view — one row per place with thumbnail, name, category, distance
              filteredPlaces.map((place) => {
                const config = CATEGORY_CONFIG[place.category];
                const imageSrc = place.photos?.[0]?.photo_url || place.image;
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => handlePlaceClick(place)}
                    className={`flex gap-3 p-4 cursor-pointer border-b border-stone-100 hover:bg-stone-50 transition-colors ${isSelected ? "bg-gold-50 border-l-4 border-l-gold-400" : ""}`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold text-stone-900 text-sm truncate">
                          {place.name}
                        </p>
                        {place.average_rating > 0 && (
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                            <span className="text-xs font-bold text-stone-700">
                              {place.average_rating}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-xs font-medium text-white mb-1 capitalize"
                        style={{ backgroundColor: config?.color || "#C9A961" }}
                      >
                        {config?.label || place.category}
                      </span>
                      {place.location && (
                        <div className="flex items-center gap-1 text-xs text-stone-400">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{place.location}</span>
                        </div>
                      )}
                      {place.distance !== null && (
                        <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                          <Navigation className="w-3 h-3" />
                          <span>{place.distance.toFixed(1)} km away</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // Grid view — 2 columns of smaller cards
              <div className="grid grid-cols-2 gap-2 p-3">
                {filteredPlaces.map((place) => {
                  const config = CATEGORY_CONFIG[place.category];
                  const imageSrc = place.photos?.[0]?.photo_url || place.image;
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <div
                      key={place.id}
                      onClick={() => handlePlaceClick(place)}
                      className={`rounded-xl overflow-hidden border cursor-pointer hover:shadow-md transition-all ${isSelected ? "border-gold-400 shadow-md" : "border-stone-200"}`}
                    >
                      <div className="h-24 bg-stone-100">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-stone-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="font-semibold text-stone-900 text-xs truncate">
                          {place.name}
                        </p>
                        <span
                          className="text-xs font-medium capitalize"
                          style={{ color: config?.color || "#C9A961" }}
                        >
                          {config?.label}
                        </span>
                        {place.distance !== null && (
                          <p className="text-xs text-stone-400">
                            {place.distance.toFixed(1)} km
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Colour legend — only shows categories that have at least one place */}
          <div className="px-4 py-3 border-t border-stone-100 bg-stone-50">
            <div className="flex flex-wrap gap-3">
              {Object.entries(CATEGORY_CONFIG)
                .filter(([key]) => categoryCounts[key] > 0)
                .map(([key, { color, label }]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 border-2"
                      style={{ borderColor: color, backgroundColor: "white" }}
                    />
                    <span className="text-xs text-stone-500">{label}</span>
                  </div>
                ))}
              {userLocation && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-xs text-stone-500">You</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leaflet map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-400 mx-auto mb-3" />
                <p className="text-stone-600 text-sm">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={initialCenter}
              zoom={urlPlaceId ? 16 : 13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* FlyTo triggers a smooth camera move when flyTo state changes */}
              {flyTo && <FlyTo position={flyTo} zoom={16} />}

              {/* User's GPS location — blue dot with a soft radius circle */}
              {userLocation && (
                <>
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={userIcon}
                  >
                    <Popup>
                      <p className="text-sm font-semibold text-stone-900">
                        You are here
                      </p>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={300}
                    pathOptions={{
                      color: "#2563EB",
                      fillColor: "#2563EB",
                      fillOpacity: 0.08,
                      weight: 1,
                    }}
                  />
                </>
              )}

              {/* Place markers */}
              {filteredPlaces.map((place) => {
                const config = CATEGORY_CONFIG[place.category];
                const color = config?.color || "#C9A961";
                const isSelected = selectedPlace?.id === place.id;
                const imageSrc = place.photos?.[0]?.photo_url || place.image;

                return (
                  <Marker
                    key={place.id}
                    position={[place.latitude, place.longitude]}
                    icon={createPinIcon(color, isSelected)}
                    eventHandlers={{ click: () => handlePlaceClick(place) }}
                  >
                    {/* Rich popup — inline styles used because Leaflet popups render outside React */}
                    <Popup maxWidth={280}>
                      <div style={{ fontFamily: "inherit" }}>
                        {imageSrc && (
                          <div
                            style={{
                              margin: "-10px -10px 10px -10px",
                              height: 140,
                              overflow: "hidden",
                              borderRadius: "8px 8px 0 0",
                            }}
                          >
                            <img
                              src={imageSrc}
                              alt={place.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        )}
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: "white",
                            backgroundColor: color,
                            marginBottom: 6,
                            textTransform: "capitalize",
                          }}
                        >
                          {config?.label || place.category}
                        </span>
                        <h3
                          style={{
                            margin: "0 0 4px",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#1c1917",
                          }}
                        >
                          {place.name}
                        </h3>
                        {place.location && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              marginBottom: 4,
                              fontSize: 12,
                              color: "#78716c",
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{place.location}</span>
                          </div>
                        )}
                        {place.average_rating > 0 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              marginBottom: 4,
                              fontSize: 12,
                              color: "#78716c",
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="#C9A961"
                              stroke="#C9A961"
                              strokeWidth="2"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <strong style={{ color: "#1c1917" }}>
                              {place.average_rating}
                            </strong>
                            <span>({place.review_count || 0} reviews)</span>
                            {place.distance !== null && (
                              <span style={{ marginLeft: 4 }}>
                                {place.distance.toFixed(1)} km away
                              </span>
                            )}
                          </div>
                        )}
                        {(place.operating_hours || place.phone) && (
                          <div
                            style={{
                              borderTop: "1px solid #e7e5e4",
                              paddingTop: 6,
                              marginBottom: 8,
                              fontSize: 12,
                              color: "#78716c",
                            }}
                          >
                            {place.operating_hours && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  marginBottom: 3,
                                }}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>{place.operating_hours}</span>
                              </div>
                            )}
                            {place.phone && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.31 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span>{place.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {place.description && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#57534e",
                              marginBottom: 10,
                              lineHeight: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {place.description}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => navigate(`/places/${place.id}`)}
                            style={{
                              flex: 1,
                              padding: "8px 0",
                              backgroundColor: "#C9A961",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            View Details
                          </button>
                          {place.latitude && place.longitude && (
                            <a
                              href={`https://www.openstreetmap.org/directions?from=&to=${place.latitude}%2C${place.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "8px 10px",
                                backgroundColor: "#f5f5f4",
                                color: "#44403c",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polygon points="3 11 22 2 13 21 11 13 3 11" />
                              </svg>
                              Directions
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
