import { useState, useEffect } from "react";
import { Palette, Building2, Brush, Sparkles, ArrowRight } from "lucide-react";
import { getAllPlaces } from "../../api/placesApi";

const categoryIcons = {
  gallery: { icon: Palette, color: "text-gold-400", bg: "bg-gold-50" },
  museum: { icon: Building2, color: "text-stone-600", bg: "bg-stone-50" },
  studio: { icon: Brush, color: "text-gold-400", bg: "bg-gold-50" },
  workshop: { icon: Sparkles, color: "text-stone-600", bg: "bg-stone-50" },
};

const categoryLabels = {
  gallery: "Art Galleries",
  museum: "Museums",
  studio: "Artist Studios",
  workshop: "Workshops",
};

const categoryDescriptions = {
  gallery: "Discover contemporary and traditional art spaces",
  museum: "Explore cultural heritage and historical collections",
  studio: "Visit working artists and their creative spaces",
  workshop: "Join hands-on creative experiences and classes",
};

export default function CategoryBrowser() {
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      const places = await getAllPlaces();
      const counts = {};

      places.forEach((place) => {
        counts[place.category] = (counts[place.category] || 0) + 1;
      });

      setCategoryCounts(counts);
    } catch (err) {
      console.error("Error fetching category counts:", err);
    }
  };

  const categories = ["gallery", "museum", "studio", "workshop"];

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-gold-400 tracking-widest uppercase mb-3">
            Browse By Category
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
            Find Your Experience
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Whether you're seeking artistic inspiration, cultural immersion, or
            hands-on creativity, explore the perfect space for you.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              count={categoryCounts[category] || 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, count }) {
  const { icon: IconComponent, color, bg } = categoryIcons[category];

  return (
    <a
      href={`/explore?category=${category}`}
      className="group bg-white rounded-xl border border-stone-200 p-8 hover:border-gold-400 hover:shadow-lg transition-all duration-300"
    >
      {/* Icon */}
      <div
        className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
      >
        <IconComponent className={`w-7 h-7 ${color}`} />
      </div>

      {/* Content */}
      <h3 className="text-xl font-serif font-semibold text-stone-800 mb-2 group-hover:text-gold-400 transition-colors">
        {categoryLabels[category]}
      </h3>
      <p className="text-sm text-stone-600 mb-5 leading-relaxed">
        {categoryDescriptions[category]}
      </p>

      {/* Count + Arrow */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gold-400">
          {count} places
        </span>
        <ArrowRight className="w-5 h-5 text-gold-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </a>
  );
}
