import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

export function PlaceCard({ place }) {
  return (
    <Link
      to={`/place/${place.id}`}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-soft card-hover"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={place.image || "/assets/placeholder.svg"}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-white backdrop-blur-sm">
            {place.category}
          </span>
          <div className="flex items-center gap-1 text-sm text-white/90">
            <Star className="w-4 h-4 fill-current text-yellow-400" />
            <span>{place.rating}</span>
          </div>
        </div>
        <h3 className="font-display font-semibold text-lg mb-1">
          {place.name}
        </h3>
        <div className="flex items-center gap-1 text-white/70 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{place.location}</span>
        </div>
      </div>
    </Link>
  );
}
