import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full h-18 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
            A
          </div>
          <span className="font-display text-xl">ArtMap</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-primary">
            Home
          </Link>
          <Link
            to="/explore"
            className="text-muted-foreground hover:text-primary"
          >
            Explore
          </Link>
          <Link
            to="/about"
            className="text-muted-foreground hover:text-primary"
          >
            About
          </Link>
        </div>

        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-accent">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-gold"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
