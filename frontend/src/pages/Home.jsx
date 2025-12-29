import { useEffect, useState } from "react";

export default function Home() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/places/")
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="pt-18">
      {/* HERO */}
      <section className="bg-gradient-to-b from-accent/30 to-background py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">
            Discover Creativity
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl">
            Explore Art & Culture in Kathmandu
          </h1>
          <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Curated creative spaces, workshops, and cultural experiences —
            thoughtfully mapped for mindful exploration.
          </p>
        </div>
      </section>

      {/* FEATURED CREATORS */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">
            Featured
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">
            Creative Spaces
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="group rounded-xl overflow-hidden shadow-soft hover:shadow-elegant transition"
              >
                <div className="overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name} // fixes ESLint warning
                    className="aspect-[4/3] object-cover w-full group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl">{place.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {place.location} · {place.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
