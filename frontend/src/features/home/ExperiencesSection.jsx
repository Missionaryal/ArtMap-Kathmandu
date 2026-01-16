import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

const experiences = [
  {
    id: 1,
    title: "Traditional Pottery Workshop",
    host: "Bhaktapur Pottery Collective",
    date: "Dec 28, 2025",
    duration: "3h",
    capacity: "8 spots left",
    price: "NPR 2,500",
    image: "/assets/placeholder1.jpg",
  },
  {
    id: 2,
    title: "Sculpture Garden Tour",
    host: "Nepal Art Council",
    date: "Jan 5, 2026",
    duration: "2h",
    capacity: "12 spots left",
    price: "NPR 1,200",
    image: "/assets/placeholder2.jpg",
  },
  {
    id: 3,
    title: "Oil Painting Masterclass",
    host: "The Art Studio Nepal",
    date: "Jan 12, 2026",
    duration: "4h",
    capacity: "5 spots left",
    price: "NPR 3,500",
    image: "/assets/placeholder3.jpg",
  },
];

export function ExperiencesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">
            Recommended Experiences
          </h2>
          <Link
            to="/events"
            className="text-primary font-medium hover:text-primary/80"
          >
            View All Events
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="group rounded-2xl bg-card border border-border/50 shadow-soft card-hover overflow-hidden"
            >
              <img
                src={exp.image}
                alt={exp.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-2">{exp.host}</p>
                <h3 className="font-display text-xl font-semibold mb-4">
                  {exp.title}
                </h3>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <span>{exp.date}</span>
                  <span>{exp.duration}</span>
                  <span>{exp.capacity}</span>
                </div>
                <Button variant="elegant" className="w-full" asChild>
                  <Link to={`/experience/${exp.id}`}>Book Now</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
