import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📍</span>
              </div>
              <span className="text-xl font-serif font-bold text-stone-800">
                ArtMap
              </span>
            </Link>
            <p className="text-sm text-stone-600 mb-4">
              Discover curated art galleries, museums, and creative spaces in
              Kathmandu. Your guide to cultural exploration.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-serif font-semibold text-stone-800 mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/explore?category=galleries"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  Galleries
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?category=museums"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  Museums
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?category=studios"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  Studios
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?category=workshops"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  Workshops
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-serif font-semibold text-stone-800 mb-4">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/creators"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  For Creators
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif font-semibold text-stone-800 mb-4">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-stone-600 hover:text-amber-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center text-sm text-stone-600">
          <p>© 2024 ArtMap. All rights reserved.</p>
          <p>Made with care in Kathmandu</p>
        </div>
      </div>
    </footer>
  );
}
