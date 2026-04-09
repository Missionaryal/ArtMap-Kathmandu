// HeroSection.jsx
// The full-screen hero shown at the very top of the homepage.
// Uses a local background image with a dark overlay for readability.
// The two CTAs navigate to the Explore page and the Map page.

import { ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/homepage hero image.jpg";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark gradient overlay so the white text is readable over any background image */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Location badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
          <MapPin className="w-4 h-4 text-gold-400" />
          <span className="text-sm text-white/90 font-medium tracking-wide">
            Discover Kathmandu's Creative Soul
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-[1.1] tracking-tight">
          Your Guide to Art & <br className="hidden md:block" />
          Culture in <span className="text-gold-400 italic">Kathmandu</span>
        </h1>

        <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed font-light">
          Explore thangka ateliers, pottery workshops, art cafés with libraries,
          and hidden creative studios across the valley.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-all text-sm shadow-lg hover:-translate-y-0.5"
          >
            Start Exploring
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/map")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/25 transition-all text-sm hover:-translate-y-0.5"
          >
            View Map
          </button>
        </div>
      </div>
    </section>
  );
}
