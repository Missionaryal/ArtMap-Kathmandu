import { useState, useEffect, useMemo } from "react";
import { Star, MapPin, Search } from "lucide-react";
import { getAllPlaces } from "../../api/placesApi";

export default function ExplorePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const data = await getAllPlaces();
      setPlaces(data);
    } catch (err) {
      console.error("Error fetching places:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = useMemo(() => {
    let filtered = places;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (place) => place.category === selectedCategory,
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (place) =>
          place.name.toLowerCase().includes(query) ||
          (place.location && place.location.toLowerCase().includes(query)) ||
          (place.description &&
            place.description.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory, places]);

  const categories = [
    { value: "all", label: "All" },
    { value: "gallery", label: "Galleries" },
    { value: "museum", label: "Museums" },
    { value: "studio", label: "Studios" },
    { value: "workshop", label: "Workshops" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-4">
            Explore Art Spaces
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl">
            Discover curated galleries, museums, studios, and workshops across
            Kathmandu
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search places by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-base"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? "bg-gold-400 text-white shadow-md"
                      : "bg-white border-2 border-stone-200 text-stone-700 hover:border-gold-400"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-stone-600">
              <span className="font-semibold text-stone-900">
                {filteredPlaces.length}
              </span>{" "}
              {filteredPlaces.length === places.length
                ? "places in Kathmandu"
                : `of ${places.length} places`}
            </p>
          </div>
        </div>

        {/* Places Grid */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
            <p className="text-stone-600 text-lg mb-4">
              No places found matching your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-gold-400 hover:text-gold-500 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceCard({ place }) {
  // Use first gallery photo → fallback to place.image → fallback to unsplash
  const imageSrc =
    place.photos?.[0]?.photo_url ||
    place.image ||
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop";

  return (
    <a href={`/places/${place.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-gold-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-stone-100">
          <img
            src={imageSrc}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="absolute top-4 left-4 px-4 py-2 text-sm font-semibold text-white bg-gold-400 rounded-full capitalize shadow-lg">
            {place.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-serif font-bold text-stone-900 mb-3 group-hover:text-gold-400 transition-colors">
            {place.name}
          </h3>
          <p className="text-sm text-stone-600 mb-4 line-clamp-2 leading-relaxed">
            {place.description || "No description available."}
          </p>
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {place.location || "Kathmandu"}
            </span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-gold-400 text-gold-400" />
              <span className="text-base font-bold text-stone-900">
                {place.average_rating > 0 ? place.average_rating : "New"}
              </span>
              {place.review_count > 0 && (
                <span className="text-sm text-stone-400">
                  ({place.review_count})
                </span>
              )}
            </div>
            <span className="text-gold-400 font-semibold group-hover:translate-x-1 transition-transform">
              View →
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
