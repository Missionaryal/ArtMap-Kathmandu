import React from "react";
import { Link } from "react-router-dom";
import { Palette, Building2, Paintbrush, Users } from "lucide-react";

const categories = [
  { id: "galleries", name: "Art Galleries", icon: Palette, count: 24 },
  { id: "museums", name: "Museums", icon: Building2, count: 12 },
  { id: "studios", name: "Artist Studios", icon: Paintbrush, count: 18 },
  { id: "workshops", name: "Workshops", icon: Users, count: 31 },
];

export function CategoriesSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium uppercase mb-2 block">
            Browse by Category
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Find Your Experience
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.id}`}
              className="group p-8 rounded-2xl bg-card border border-border/50 shadow-soft card-hover text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <cat.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {cat.name}
              </h3>
              <p className="text-sm text-primary">{cat.count} places</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
