import { useState, useEffect } from "react";
import { Star, MapPin } from "lucide-react";
import { getAllPlaces } from "../../api/placesApi";

export default function FeaturedCreators() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const data = await getAllPlaces();
      // Get first 4 places for featured section
      setPlaces(data.slice(0, 4));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching places:", err);
      setError("Failed to load places");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-stone-600">Loading places...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-gold-400 tracking-widest uppercase mb-3">
            Curated For You
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
            Featured Places
          </h2>
          <a
            href="/explore"
            className="text-gold-400 hover:text-gold-500 font-medium inline-flex items-center gap-1 group"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Place Card Component
function PlaceCard({ place }) {
  // Placeholder image if no image
  const imageSrc =
    place.image ||
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop";

  return (
    <a href={`/places/${place.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-gold-400 transition-all duration-300 hover:shadow-lg">
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-stone-100">
          <img
            src={imageSrc}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-medium text-gold-700 bg-white/95 backdrop-blur-sm rounded-full capitalize">
            {place.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-serif font-semibold text-stone-800 mb-2 group-hover:text-gold-400 transition-colors">
            {place.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-stone-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{place.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
            <span className="text-sm font-semibold text-stone-800">
              {place.average_rating || "0.0"}
            </span>
            <span className="text-sm text-stone-400">
              ({place.review_count || 0})
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
