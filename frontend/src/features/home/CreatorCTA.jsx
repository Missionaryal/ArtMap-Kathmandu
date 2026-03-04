import { Sparkles, ArrowRight } from "lucide-react";
import Button from "../../components/ui/Button";

export default function CreatorCTA() {
  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-stone-600">
            Join Our Creative Community
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-5 leading-tight">
          Share Your Art Space with the World
        </h2>

        {/* Description */}
        <p className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Are you a gallery owner, artist, or workshop organizer? Join ArtMap as
          a Creator and connect with art enthusiasts exploring Kathmandu's
          cultural scene.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            className="inline-flex items-center gap-2"
          >
            Become a Creator
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
