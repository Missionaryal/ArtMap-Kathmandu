import React from "react";
import { Link } from "react-router-dom";

const featuredPlaces = [
  {
    id: 1,
    name: "Siddhartha Art Gallery",
    category: "Gallery",
    location: "Baber Mahal",
    rating: 4.9,
    image: "/assets/placeholder1.jpg",
  },
  {
    id: 2,
    name: "Patan Museum",
    category: "Museum",
    location: "Patan Durbar",
    rating: 4.8,
    image: "/assets/placeholder2.jpg",
  },
  {
    id: 3,
    name: "The Art Studio Nepal",
    category: "Studio",
    location: "Jhamsikhel",
    rating: 4.7,
    image: "/assets/placeholder3.jpg",
  },
  {
    id: 4,
    name: "Pottery Square Workshop",
    category: "Workshop",
    location: "Bhaktapur",
    rating: 4.9,
    image: "/assets/placeholder4.jpg",
  },
];

export function FeaturedSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-primary text-sm font-medium uppercase mb-2 block">
              Curated for You
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">
              Featured Creators
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-primary font-medium hover:text-primary/80"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPlaces.map((place) => (
            <Link
              key={place.id}
              to={`/place/${place.id}`}
              className="group relative rounded-2xl bg-card shadow-soft overflow-hidden card-hover"
            >
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="p-6">
                <h3 className="font-display font-semibold text-lg mb-1">
                  {place.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {place.category} • {place.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
