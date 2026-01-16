import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import { Button } from "../ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <nav className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-semibold">ArtMap</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="gold" size="sm" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`${
            isOpen ? "max-h-80 pb-6" : "max-h-0"
          } md:hidden overflow-hidden transition-all`}
        >
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="gold" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
