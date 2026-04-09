// Footer.jsx
// The site footer shown at the bottom of every page.
// Contains navigation links, contact info, and copyright notice.

import { Link } from "react-router-dom";
import logo from "../../assets/artmap final logo.jpeg";

export default function Footer() {
  return (
    <footer className="bg-[#F5F0E8] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand column — logo and tagline */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <img
                src={logo}
                alt="ArtMap"
                className="h-10 w-10 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-serif font-bold text-xl text-stone-900">
                ArtMap
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed">
              Discovering and preserving Kathmandu's living art heritage — one
              gallery, atelier, and studio at a time.
            </p>
          </div>

          {/* Navigation links */}
          <div className="flex gap-16">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm mb-4">
                Explore
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { to: "/explore", label: "All Spaces" },
                  { to: "/map", label: "Map View" },
                  { to: "/explore?category=thangka", label: "Thangka" },
                  { to: "/explore?category=pottery", label: "Pottery" },
                ].map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-stone-500 hover:text-gold-500 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm mb-4">
                Company
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { to: "/about", label: "About Us" },
                  { to: "/register", label: "For Creators" },
                  { to: "/login", label: "Sign In" },
                ].map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-stone-500 hover:text-gold-500 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-stone-900 text-sm mb-4">
              Contact
            </h3>
            <p className="text-sm text-stone-500 mb-1">hello@artmapktm.com</p>
            <p className="text-sm text-stone-500 mb-1">@artmapkathmandu</p>
            <p className="text-sm text-stone-500">Kathmandu, Nepal</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-400">
          <p>© 2026 ArtMap Kathmandu. All rights reserved.</p>
          <p>
            Made with <span className="text-gold-500">♥</span> for the art of
            Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
