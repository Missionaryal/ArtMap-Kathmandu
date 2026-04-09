// FeaturedCreators.jsx
// Homepage section showing the 3 most recently added art spaces.
// Displays a skeleton loader while fetching, an empty state if no places exist,
// and a "View All" link to the Explore page.

import { useState, useEffect } from "react";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllPlaces } from "../../api/placesApi";

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

// Used as a fallback if the place has no photos and no legacy image field
const FALLBACK =
  "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=600&h=400&fit=crop";

export default function FeaturedCreators() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const data = await getAllPlaces();
      // Only show the 3 most recent places on the homepage
      setPlaces(data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-gold-500 tracking-widest uppercase mb-2">
              Curated For You
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900">
              Featured Art Spaces
            </h2>
          </div>
          <button
            onClick={() => navigate("/explore")}
            className="hidden sm:flex items-center gap-1.5 text-gold-500 hover:text-gold-600 font-semibold text-sm transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Skeleton loader — 3 placeholder cards while fetching */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-stone-100 animate-pulse bg-white"
              >
                <div className="h-56 bg-stone-100 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-5 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          // Empty state — shown when no places have been registered yet
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
            <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gold-400" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg mb-2">
              No Places Yet
            </h3>
            <p className="text-stone-400 text-sm max-w-xs mx-auto mb-6">
              Be the first creator to list your art space on ArtMap!
            </p>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors text-sm"
            >
              Register as Creator
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PlaceCard({ place }) {
  const navigate = useNavigate();
  const imageSrc = place.photos?.[0]?.photo_url || place.image || FALLBACK;

  return (
    <div
      onClick={() => navigate(`/places/${place.id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5 flex flex-col"
    >
      <div className="relative h-56 overflow-hidden bg-stone-100">
        <img
          src={imageSrc}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-gold-500 rounded-full capitalize shadow-sm">
          {CATEGORY_LABELS[place.category] || place.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif font-bold text-stone-900 text-lg mb-2 group-hover:text-gold-600 transition-colors">
          {place.name}
        </h3>
        <p className="text-sm text-stone-400 mb-3 line-clamp-2 leading-relaxed flex-1">
          {place.description || "A unique art space in Kathmandu."}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-4">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{place.location || "Kathmandu"}</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
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
