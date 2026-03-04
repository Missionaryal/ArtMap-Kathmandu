import { Calendar, Clock, Users } from "lucide-react";
import Button from "../../components/ui/Button";

// STATIC DATA - Replace with API call later
const events = [
  {
    id: 1,
    title: "Traditional Pottery Workshop",
    organizer: "Bhaktapur Pottery Collective",
    date: "Dec 28, 2024",
    duration: "3 hours",
    spotsLeft: 8,
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Sculpture Garden Tour",
    organizer: "Nepal Art Council",
    date: "Jan 5, 2025",
    duration: "2 hours",
    spotsLeft: 12,
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Oil Painting Masterclass",
    organizer: "The Art Studio Nepal",
    date: "Jan 12, 2025",
    duration: "4 hours",
    spotsLeft: 5,
    price: 3500,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
  },
];

export default function UpcomingEvents() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="text-xs font-semibold text-amber-600 tracking-widest uppercase mb-3">
              Upcoming Events
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800">
              Recommended Experiences
            </h2>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium group"
          >
            View All Events
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-amber-600 hover:shadow-lg transition-all duration-300">
      {/* Image with Price Tag */}
      <div className="relative h-52 overflow-hidden bg-stone-100">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-4 right-4 px-4 py-2 text-sm font-bold text-stone-800 bg-white/95 backdrop-blur-sm rounded-full">
          NPR {event.price.toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-xs text-stone-500 mb-2 uppercase tracking-wide">
          {event.organizer}
        </p>
        <h3 className="text-xl font-serif font-semibold text-stone-800 mb-4">
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2.5 text-sm text-stone-600">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-stone-600">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>{event.duration}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-stone-600">
            <Users className="w-4 h-4 text-stone-400" />
            <span>{event.spotsLeft} spots left</span>
          </div>
        </div>

        {/* CTA */}
        <Button variant="secondary" size="md" className="w-full">
          Book Now
        </Button>
      </div>
    </div>
  );
}
