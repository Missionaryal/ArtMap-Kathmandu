// CategoryBrowser.jsx
// A homepage section showing the four main place categories as clickable cards.
// Each card shows a live count of how many places exist in that category,
// fetched from the API on mount. Clicking navigates to the Explore page pre-filtered.

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Palette, Building2, Brush, Users, ArrowRight } from "lucide-react";
import { getAllPlaces } from "../../api/placesApi";

const MAIN_CATEGORIES = [
  {
    value: "gallery",
    label: "Art Galleries",
    desc: "Discover contemporary and traditional art spaces",
    icon: Palette,
  },
  {
    value: "museum",
    label: "Museums",
    desc: "Explore cultural heritage and historical collections",
    icon: Building2,
  },
  {
    value: "studio",
    label: "Artist Studios",
    desc: "Visit working artists and their creative spaces",
    icon: Brush,
  },
  {
    value: "workshop",
    label: "Workshops",
    desc: "Join hands-on creative experiences and classes",
    icon: Users,
  },
];

export default function CategoryBrowser() {
  const navigate = useNavigate();
  // { gallery: 3, museum: 1, ... } — built by counting all places by category
  const [counts, setCounts] = useState({});

  useEffect(() => {
    getAllPlaces()
      .then((places) => {
        // Count how many places belong to each category
        const c = {};
        places.forEach((p) => {
          c[p.category] = (c[p.category] || 0) + 1;
        });
        setCounts(c);
      })
      .catch(() => {}); // Silently fail — card still renders with "0 places"
  }, []);

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-gold-500 tracking-widest uppercase mb-4">
            Browse by Category
          </p>
          <h2 className="text-5xl font-serif font-bold text-stone-900 mb-5">
            Find Your Experience
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
            Whether you're seeking artistic inspiration, cultural immersion, or
            hands-on creativity, explore the perfect space for you.
          </p>
        </div>

        {/* 4 category cards — clicking navigates to explore page with the category pre-selected */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MAIN_CATEGORIES.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              onClick={() => navigate(`/explore?category=${value}`)}
              className="group bg-white rounded-2xl p-7 text-left border border-stone-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg mb-2">{label}</h3>
              <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                {desc}
              </p>
              <div className="flex items-center justify-between">
                {/* Live count from the API */}
                <span className="text-sm font-semibold text-gold-500">
                  {counts[value] || 0} places
                </span>
                {/* Arrow turns gold on hover */}
                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-gold-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
