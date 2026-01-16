import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export function CTASection() {
  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-semibold mb-6">
          Share Your Art Space with the World
        </h2>
        <p className="text-lg text-muted-foreground mb-10">
          Are you a gallery owner, artist, or workshop organizer? Join ArtMap as
          a Creator.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="gold" asChild>
            <Link to="/register?type=creator">Become a Creator</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
