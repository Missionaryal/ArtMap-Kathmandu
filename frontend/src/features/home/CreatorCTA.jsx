// CreatorCTA.jsx
// The "Become a Creator" call-to-action section shown at the bottom of the homepage.
// Encourages gallery owners, artists, and workshop organizers to register.

import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreatorCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        {/* Small badge above the heading */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 rounded-full mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-gold-500" />
          <span className="text-sm font-medium text-stone-700">
            Join Our Creative Community
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-5 leading-tight">
          Share Your Art Space with the World
        </h2>

        <p className="text-stone-500 mb-10 leading-relaxed max-w-xl mx-auto">
          Are you a gallery owner, artist, or workshop organizer? Join ArtMap as
          a Creator and connect with art enthusiasts exploring Kathmandu's
          cultural scene.
        </p>

        {/* Primary CTA goes to registration, secondary goes to the About page */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-all text-sm shadow-md hover:-translate-y-0.5"
          >
            Become a Creator
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/about")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-stone-50 text-stone-800 font-semibold rounded-xl border border-stone-200 transition-all text-sm hover:-translate-y-0.5"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
