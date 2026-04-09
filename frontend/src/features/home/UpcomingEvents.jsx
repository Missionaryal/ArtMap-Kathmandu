// UpcomingEvents.jsx
// Homepage section showing the next 3 upcoming events.
// Includes a booking modal that posts directly to the backend without requiring login —
// users just enter their name, email, phone, and number of spots.
// Payment is collected in person at the venue (no online payment).

import { useState, useEffect } from "react";
import { Calendar, Clock, Users, X, Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUpcomingEvents } from "../../api/eventsApi";

// Modal that lets a visitor book spots for an event
function BookingModal({ event, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    spots: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  // 'success' switches the modal to a confirmation screen
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }

    setSubmitting(true);
    try {
      // The booking endpoint doesn't require a JWT token — any visitor can book
      const res = await fetch(
        `http://localhost:8000/api/events/${event.id}/book/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            spots: parseInt(form.spots),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking failed");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-serif font-bold text-stone-900">
            Book Your Spot
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Confirmation screen shown after successful booking */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-stone-500 text-sm mb-6">
              {event.is_free
                ? "This event is free!"
                : `Please pay NPR ${Number(event.price).toLocaleString()} at the venue.`}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gold-500 text-white rounded-xl font-medium hover:bg-gold-600 transition-colors text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Event summary at the top of the form */}
            <div className="bg-stone-50 rounded-xl p-4">
              <p className="font-semibold text-stone-900 text-sm mb-1">
                {event.title}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.start_time}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.spots_left} spots left
                </span>
                <span className="font-semibold text-stone-700">
                  {event.is_free
                    ? "Free"
                    : `NPR ${Number(event.price).toLocaleString()}`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Phone (optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+977 98XXXXXXXX"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Spots (max {event.spots_left})
              </label>
              <input
                type="number"
                name="spots"
                value={form.spots}
                onChange={handleChange}
                min="1"
                max={event.spots_left}
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            {/* Payment notice — only shown for paid events */}
            {!event.is_free && (
              <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                Payment of NPR {Number(event.price).toLocaleString()} is
                collected at the venue.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gold-500 text-white rounded-xl font-semibold text-sm hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
            <p className="text-xs text-stone-400 text-center">
              No online payment — pay at the venue
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// Individual event card
function EventCard({ event, onBook }) {
  const imageSrc =
    event.image_url ||
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-0.5">
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageSrc}
          alt={event.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        {/* Price badge top-right */}
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
          <span className="text-xs font-bold text-stone-900">
            {event.is_free
              ? "Free"
              : `NPR ${Number(event.price).toLocaleString()}`}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-1">
          {event.creator_name}
        </p>
        <h3 className="font-serif font-bold text-stone-900 text-lg mb-3 leading-snug">
          {event.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {event.duration_hours}h
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {event.spots_left} spots left
          </span>
        </div>
        {/* Book Now button is disabled if no spots remain */}
        <button
          onClick={() => onBook(event)}
          disabled={event.is_full}
          className={`mt-auto w-full py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
            event.is_full
              ? "border-stone-200 text-stone-300 cursor-not-allowed"
              : "border-gold-400 text-gold-600 hover:bg-gold-500 hover:text-white hover:border-gold-500"
          }`}
        >
          {event.is_full ? "Fully Booked" : "Book Now"}
        </button>
      </div>
    </div>
  );
}

// Main section component
export default function UpcomingEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Stores the event the user clicked "Book Now" on, used to open the modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getUpcomingEvents();
      // Only show 3 events on the homepage — full list is on the Explore page
      setEvents(data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-gold-500 tracking-widest uppercase mb-2">
              Upcoming Events
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900">
              Recommended Experiences
            </h2>
          </div>
          {events.length > 0 && (
            <button
              onClick={() => navigate("/explore")}
              className="hidden sm:flex items-center gap-1.5 text-gold-500 hover:text-gold-600 font-semibold text-sm transition-colors group"
            >
              View All Events
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Skeleton loader */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-stone-100 animate-pulse"
              >
                <div className="h-52 bg-stone-100 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-5 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-2/3" />
                  <div className="h-10 bg-stone-100 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onBook={setSelectedEvent}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gold-400" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg mb-2">
              No Events Yet
            </h3>
            <p className="text-stone-400 text-sm max-w-xs mx-auto">
              Creators haven't listed any upcoming events yet. Check back soon
              for workshops, classes and experiences!
            </p>
          </div>
        )}
      </div>

      {/* Booking modal — only rendered when a user clicks "Book Now" */}
      {selectedEvent && (
        <BookingModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  );
}
