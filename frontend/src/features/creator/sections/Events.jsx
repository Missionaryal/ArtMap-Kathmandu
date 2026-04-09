// Events.jsx
// The events section of the creator dashboard.
// Creators can create, edit, and delete workshops, classes, exhibitions, etc.
// Also shows a reservations panel with everyone who has booked a spot.

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Calendar,
  Clock,
  Users,
  Tag,
  Trash2,
  Edit,
  Image,
  Mail,
  Phone,
} from "lucide-react";
import {
  getCreatorEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../../api/eventsApi";
import { getCreatorPlaces } from "../../../api/creatorApi";
import api from "../../../api/axiosConfig";

const EVENT_TYPES = [
  { value: "workshop", label: "Workshop" },
  { value: "class", label: "Class" },
  { value: "tour", label: "Guided Tour" },
  { value: "exhibition", label: "Exhibition" },
  { value: "performance", label: "Performance" },
  { value: "talk", label: "Artist Talk" },
  { value: "retreat", label: "Art Retreat" },
];

// Default empty form values for creating a new event
const EMPTY_FORM = {
  title: "",
  description: "",
  event_type: "workshop",
  date: "",
  start_time: "",
  duration_hours: "2",
  price: "0",
  is_free: false,
  total_spots: "10",
  place: "",
  is_published: true,
};

// Convert an existing event object into the form format for editing
function toEditForm(event) {
  return {
    title: event.title || "",
    description: event.description || "",
    event_type: event.event_type || "workshop",
    date: event.date || "",
    start_time: event.start_time || "",
    duration_hours: String(event.duration_hours || "2"),
    price: event.is_free ? "0" : String(event.price || "0"),
    is_free: event.is_free || false,
    total_spots: String(event.total_spots || "10"),
    place: event.place || "",
    is_published: event.is_published ?? true,
  };
}

// Modal form for creating or editing an event
function EventForm({ onSubmit, onCancel, initialData, places, loading }) {
  const [form, setForm] = useState(
    initialData ? toEditForm(initialData) : EMPTY_FORM,
  );
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.image_url || null,
  );
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: type === "checkbox" ? checked : value };
      // Auto-set price to 0 when the "Free" checkbox is ticked
      if (name === "is_free" && checked) updated.price = "0";
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.date) {
      setError("Date is required");
      return;
    }
    if (!form.start_time) {
      setError("Start time is required");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      // Don't send an empty place — the backend accepts null but not an empty string
      if (key === "place" && !value) return;
      if (key === "price") {
        formData.append(key, form.is_free ? "0" : value || "0");
        return;
      }
      formData.append(key, value);
    });
    if (image) formData.append("image", image);

    try {
      await onSubmit(formData);
    } catch (err) {
      // Show a readable error message from the API response
      const errData = err.response?.data;
      if (errData) {
        const msg =
          typeof errData === "string"
            ? errData
            : Object.entries(errData)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" | ");
        setError(msg);
      } else {
        setError("Failed to save event. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 sticky top-0 bg-white z-10">
          <h2 className="font-serif font-bold text-stone-900 text-lg">
            {initialData ? "Edit Event" : "Create New Event"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Event image upload */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Event Image{" "}
              <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-44 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-gold-400 transition-colors">
                <Image className="w-7 h-7 text-stone-400 mb-2" />
                <span className="text-sm text-stone-500">
                  Upload event image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Traditional Pottery Workshop"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What will participants experience?"
              rows={3}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
            />
          </div>

          {/* Event type and place */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Event Type
              </label>
              <select
                name="event_type"
                value={form.event_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Place (optional)
              </label>
              <select
                name="place"
                value={form.place}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
                <option value="">Select place...</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, time, duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Duration (hrs)
              </label>
              <input
                type="number"
                name="duration_hours"
                value={form.duration_hours}
                onChange={handleChange}
                min="0.5"
                max="24"
                step="0.5"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
          </div>

          {/* Price and spots */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Price (NPR)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  name="price"
                  value={form.is_free ? "" : form.price}
                  onChange={handleChange}
                  disabled={form.is_free}
                  min="0"
                  placeholder={form.is_free ? "Free" : "0"}
                  className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:bg-stone-50 disabled:text-stone-400"
                />
                <label className="flex items-center gap-2 text-sm text-stone-600 whitespace-nowrap cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_free"
                    checked={form.is_free}
                    onChange={handleChange}
                    className="w-4 h-4 accent-gold-400"
                  />
                  Free
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Total Spots
              </label>
              <input
                type="number"
                name="total_spots"
                value={form.total_spots}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
          </div>

          {/* Published / Draft toggle */}
          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, is_published: !p.is_published }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_published ? "bg-gold-400" : "bg-stone-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_published ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-stone-900">
                {form.is_published ? "Published" : "Draft"}
              </p>
              <p className="text-xs text-stone-500">
                {form.is_published
                  ? "Visible on home page"
                  : "Only visible to you"}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gold-400 text-white rounded-xl text-sm font-medium hover:bg-gold-500 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : initialData
                  ? "Save Changes"
                  : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Panel showing all bookings across all events, with an optional filter by event
function ReservationsPanel({ events }) {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("all");

  useEffect(() => {
    // Load all bookings for this creator from the API
    api
      .get("/creator/bookings/")
      .then((res) => setAllBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter bookings by the selected event
  const filtered =
    selectedEvent === "all"
      ? allBookings
      : allBookings.filter((b) => String(b.event) === selectedEvent);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-400" />
      </div>
    );

  return (
    <div>
      <div className="mb-4">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <option value="all">All Events</option>
          {events.map((e) => (
            <option key={e.id} value={String(e.id)}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
          <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No reservations yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {filtered.map((booking) => (
            <div key={booking.id} className="px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                <span className="text-gold-600 font-semibold text-sm">
                  {booking.name[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 text-sm">
                  {booking.name}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-stone-400">
                    <Mail className="w-3 h-3" />
                    {booking.email}
                  </span>
                  {booking.phone && (
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Phone className="w-3 h-3" />
                      {booking.phone}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {booking.event_title}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-50 text-gold-700 text-xs font-semibold rounded-full">
                  <Users className="w-3 h-3" />
                  {booking.spots} spot{booking.spots > 1 ? "s" : ""}
                </span>
                <p className="text-xs text-stone-400 mt-1">
                  {new Date(booking.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// A single event card shown in the upcoming/past event lists
function EventCard({ event, onEdit, onDelete, onViewBookings }) {
  const imageSrc =
    event.image_url ||
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop";

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden flex gap-0 hover:border-gold-200 transition-colors">
      <div className="w-36 flex-shrink-0">
        <img
          src={imageSrc}
          alt={event.title}
          className="w-full h-full object-cover min-h-[120px]"
        />
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-stone-900 mb-1">{event.title}</h3>
            {event.description && (
              <p className="text-xs text-stone-500 mb-2 line-clamp-1">
                {event.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {event.start_time} ({event.duration_hours} hours)
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {event.spots_left}/{event.total_spots} spots left
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {event.is_free
                  ? "Free"
                  : `NPR ${Number(event.price).toLocaleString()}`}
              </span>
            </div>
            <button
              onClick={() => onViewBookings(event)}
              className="flex items-center gap-2 px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Reservations ({event.booking_count || 0})
            </button>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(event)}
              className="p-2 text-stone-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Events component — manages state and coordinates all sub-components
export default function Events() {
  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsData, placesData] = await Promise.all([
        getCreatorEvents(),
        getCreatorPlaces(),
      ]);
      setEvents(eventsData);
      setPlaces(placesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    setFormLoading(true);
    try {
      await createEvent(formData);
      setShowForm(false);
      fetchData();
    } catch (err) {
      throw err; // Re-throw so EventForm can show the error
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setFormLoading(true);
    try {
      await updateEvent(editingEvent.id, formData);
      setEditingEvent(null);
      fetchData();
    } catch (err) {
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Delete this event? All bookings will also be deleted."))
      return;
    try {
      await deleteEvent(eventId);
      setEvents(events.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error(err);
    }
  };

  const upcomingEvents = events.filter((e) => e.is_upcoming && !e.is_cancelled);
  const pastEvents = events.filter((e) => !e.is_upcoming || e.is_cancelled);
  const totalBookings = events.reduce(
    (sum, e) => sum + (e.booking_count || 0),
    0,
  );
  const totalSpots = events.reduce((sum, e) => sum + (e.spots_taken || 0), 0);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-400" />
      </div>
    );

  return (
    <div>
      {/* Create event modal */}
      {showForm && (
        <EventForm
          key="create"
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          places={places}
          loading={formLoading}
        />
      )}
      {/* Edit event modal */}
      {editingEvent && (
        <EventForm
          key={`edit-${editingEvent.id}`}
          onSubmit={handleUpdate}
          onCancel={() => setEditingEvent(null)}
          initialData={editingEvent}
          places={places}
          loading={formLoading}
        />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-1">
            Events
          </h1>
          <p className="text-stone-500 text-sm">
            Create and manage events for your place.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 text-white rounded-xl hover:bg-gold-500 transition-colors text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Upcoming Events",
            value: upcomingEvents.length,
            icon: Calendar,
          },
          { label: "Total Reservations", value: totalBookings, icon: Users },
          { label: "Total Spots Booked", value: totalSpots, icon: Tag },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{value}</p>
              <p className="text-xs text-stone-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {[
          { id: "upcoming", label: `Upcoming (${upcomingEvents.length})` },
          { id: "past", label: `Past (${pastEvents.length})` },
          { id: "reservations", label: "Reservations" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "reservations" ? (
        <ReservationsPanel events={events} />
      ) : (
        <div>
          {(activeTab === "upcoming" ? upcomingEvents : pastEvents).length ===
          0 ? (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 text-sm mb-4">
                {activeTab === "upcoming"
                  ? "No upcoming events"
                  : "No past events"}
              </p>
              {activeTab === "upcoming" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2.5 bg-gold-400 text-white rounded-xl text-sm font-medium hover:bg-gold-500 transition-colors"
                >
                  Create Your First Event
                </button>
              )}
            </div>
          ) : (
            // Past events shown with reduced opacity to visually distinguish them
            <div
              className={`space-y-3 ${activeTab === "past" ? "opacity-70" : ""}`}
            >
              {(activeTab === "upcoming" ? upcomingEvents : pastEvents).map(
                (event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => setEditingEvent(event)}
                    onDelete={handleDelete}
                    onViewBookings={() => setActiveTab("reservations")}
                  />
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
