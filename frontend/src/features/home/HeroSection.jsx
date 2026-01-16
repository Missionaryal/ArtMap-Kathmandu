import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import heroImage from "../../assets/hero.jpg"; // replace with actual image

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
      </div>
      <div className="relative z-10 container mx-auto px-6 pt-20 text-center">
        <h1 className="font-display text-5xl md:text-6xl font-semibold mb-6">
          Explore Art & Culture in Kathmandu
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Discover galleries, studios, posts, and reviews from local creators.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="gold" asChild>
            <Link to="/explore">Explore Now</Link>
          </Button>
          <Button variant="elegant" asChild>
            <Link to="/map">View Map</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
