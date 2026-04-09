// ExplorePage.jsx
// The main discovery page showing all art spaces in a filterable grid.
// Users can search by name/location, filter by category using pill buttons,
// or access the full category list via the Filters dropdown.
// The category filter also syncs with the URL so links like
// /explore?category=thangka work and can be shared.

import { useState, useEffect, useMemo, useRef } from "react";
import { Star, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllPlaces } from "../../api/placesApi";

// The 5 most common categories shown as pill buttons at the top
const PILL_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "gallery", label: "Galleries" },
  { value: "museum", label: "Museums" },
  { value: "studio", label: "Studios" },
  { value: "workshop", label: "Workshops" },
];

// All categories shown in the Filters dropdown
const ALL_CATEGORIES = [
  { value: "gallery", label: "Art Gallery" },
  { value: "museum", label: "Museum" },
  { value: "thangka", label: "Thangka Painting" },
  { value: "pottery", label: "Pottery & Ceramics" },
  { value: "cafe", label: "Art Café & Library" },
  { value: "workshop", label: "Workshop" },
  { value: "studio", label: "Artist Studio" },
  { value: "weaving", label: "Weaving & Textile" },
  { value: "photography", label: "Photography" },
  { value: "sculpture", label: "Sculpture" },
];

// Human-readable label for each category value
const CATEGORY_LABELS = {
  gallery: "Art Gallery",
  museum: "Museum",
  thangka: "Thangka",
  pottery: "Pottery",
  cafe: "Art Café",
  workshop: "Workshop",
  studio: "Studio",
  weaving: "Weaving",
  sculpture: "Sculpture",
  photography: "Photography",
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // Initialise from URL param so navigating to /explore?category=thangka works
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef();

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Keep selectedCategory in sync when the URL changes (e.g. browser back/forward)
  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat || "all");
  }, [searchParams]);

  // Close the dropdown if the user clicks anywhere outside it
  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchPlaces = async () => {
    try {
      const data = await getAllPlaces();
      setPlaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setFilterOpen(false);
    // Update the URL so the filter can be bookmarked or shared
    if (value === "all") setSearchParams({});
    else setSearchParams({ category: value });
  };

  // useMemo so filtering only re-runs when the search query, category, or data actually changes
  const filteredPlaces = useMemo(() => {
    let filtered = places;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }
    return filtered;
  }, [searchQuery, selectedCategory, places]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-3">
          Explore Art Spaces
        </h1>
        <p className="text-stone-500 text-lg mb-10">
          Discover galleries, museums, studios, and workshops across Kathmandu
        </p>

        {/* Search bar and Filters dropdown */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search places, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters button with dropdown containing all categories */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-5 py-3.5 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:border-stone-300 shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-100 rounded-2xl shadow-xl z-20 py-2">
                <p className="px-4 py-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">
                  All Categories
                </p>
                <div className="h-px bg-stone-100 mb-1" />
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      selectedCategory === cat.value
                        ? "text-gold-600 font-semibold bg-gold-50"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pill buttons for the 5 main categories */}
        <div className="flex items-center gap-2 flex-wrap">
          {PILL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.value
                  ? "bg-gold-500 text-white shadow-sm"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
          {/* If the active filter is NOT in the pill list, show it as a dismissable chip */}
          {selectedCategory !== "all" &&
            !PILL_CATEGORIES.find((c) => c.value === selectedCategory) && (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 text-white rounded-full text-sm font-medium">
                {CATEGORY_LABELS[selectedCategory]}
                <button onClick={() => handleCategoryChange("all")}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Results grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
        <p className="text-sm text-stone-400 mb-6">
          {filteredPlaces.length} art space
          {filteredPlaces.length !== 1 ? "s" : ""} found
        </p>
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <p className="text-stone-500 mb-4">No places found.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                handleCategoryChange("all");
              }}
              className="text-gold-500 hover:text-gold-600 font-medium text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual place card shown in the results grid
function PlaceCard({ place }) {
  const navigate = useNavigate();
  // Use the first gallery photo, then the legacy image field, then an Unsplash fallback
  const imageSrc =
    place.photos?.[0]?.photo_url ||
    place.image ||
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop";

  return (
    <div
      onClick={() => navigate(`/places/${place.id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
    >
      <div className="relative h-60 overflow-hidden bg-stone-100">
        <img
          src={imageSrc}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-gold-500 rounded-full capitalize">
          {CATEGORY_LABELS[place.category] || place.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-serif font-bold text-stone-900 text-lg mb-2 group-hover:text-gold-600 transition-colors">
          {place.name}
        </h3>
        <p className="text-sm text-stone-400 mb-3 line-clamp-2 leading-relaxed">
          {place.description || "A unique art space in Kathmandu."}
        </p>
        <div className="flex items-center gap-1.5 text-sm text-stone-400 mb-4">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{place.location || "Kathmandu"}</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
            {/* Show "New" instead of 0.0 if no reviews yet */}
            <span className="text-sm font-bold text-stone-900">
              {place.average_rating > 0 ? place.average_rating : "New"}
            </span>
            {place.review_count > 0 && (
              <span className="text-xs text-stone-400">
                ({place.review_count})
              </span>
            )}
          </div>
          <span className="text-xs text-gold-500 font-semibold group-hover:translate-x-0.5 transition-transform">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}
