import Button from "../../components/ui/Button";
import { MapPin, ArrowRight } from "lucide-react";
import heroImage from "../../assets/homepage hero image.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Art Gallery in Kathmandu"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Small badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full mb-6 shadow-lg">
          <MapPin className="w-4 h-4 text-gold-400" />
          <span className="text-sm text-stone-700 font-medium">
            Discover Kathmandu's Creative Soul
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
          Your Guide to Art & Culture in{" "}
          <span className="text-gold-400">Kathmandu</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          Explore curated galleries, museums, creative studios, and workshops.
          Experience the vibrant cultural landscape of Nepal's capital.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            className="inline-flex items-center gap-2 shadow-2xl"
          >
            Start Exploring
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white/90 backdrop-blur-sm text-stone-800 border-white hover:bg-white shadow-2xl"
          >
            View Map
          </Button>
        </div>
      </div>
    </section>
  );
}
