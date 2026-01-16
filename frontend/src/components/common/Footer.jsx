import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-cream-dark border-t border-border">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-semibold">
                ArtMap
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              Discover curated art galleries and creative spaces in Kathmandu.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {[
            {
              title: "Explore",
              links: ["Galleries", "Museums", "Studios", "Workshops"],
            },
            {
              title: "Company",
              links: ["About Us", "For Creators", "Contact"],
            },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-display text-lg font-semibold mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((label) => (
                  <li key={label}>
                    <Link
                      to="#"
                      className="text-muted-foreground hover:text-primary text-sm"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="gold-divider mt-12 mb-8" />
        <div className="flex justify-between text-muted-foreground text-sm">
          <p>© 2026 ArtMap. All rights reserved.</p>
          <p>Made in Kathmandu</p>
        </div>
      </div>
    </footer>
  );
}
