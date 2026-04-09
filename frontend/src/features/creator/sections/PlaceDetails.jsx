// PlaceDetails.jsx
// The Place Details section of the creator dashboard.
// Lets creators create or edit the information shown on their public place page.
// If the creator has no place yet, shows a "Create My Place" prompt.

import { Edit, Eye, Clock, Phone, Globe, Mail, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getCreatorPlaces,
  createPlace,
  updatePlace,
} from "../../../api/creatorApi";

const CATEGORY_OPTIONS = [
  { value: "gallery", label: "Art Gallery" },
  { value: "museum", label: "Museum" },
  { value: "studio", label: "Artist Studio" },
  { value: "workshop", label: "Workshop" },
  { value: "cafe", label: "Art Cafe" },
  { value: "thangka", label: "Thangka Art" },
  { value: "pottery", label: "Pottery" },
  { value: "weaving", label: "Weaving" },
  { value: "sculpture", label: "Sculpture" },
  { value: "photography", label: "Photography" },
];

// Default form values — coordinates default to central Kathmandu
const EMPTY_FORM = {
  name: "",
  category: "gallery",
  location: "",
  latitude: 27.7172,
  longitude: 85.324,
  description: "",
  phone: "",
  website: "",
  email: "",
  operating_hours: "",
};

export default function PlaceDetails({ onPlaceCreated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPlace();
  }, []);

  const fetchPlace = async () => {
    try {
      const places = await getCreatorPlaces();
      if (places.length > 0) {
        const p = places[0];
        setPlace(p);
        // Populate the form with existing place data
        setFormData({
          name: p.name || "",
          category: p.category || "gallery",
          location: p.location || "",
          latitude: p.latitude || 27.7172,
          longitude: p.longitude || 85.324,
          description: p.description || "",
          phone: p.phone || "",
          website: p.website || "",
          email: p.email || "",
          operating_hours: p.operating_hours || "",
        });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Place name is required.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    setSaving(true);
    try {
      if (place) {
        // Update existing place
        const updated = await updatePlace(place.id, formData);
        setSuccess("Place updated successfully!");
        setPlace(updated);
      } else {
        // Create brand new place — notify the parent dashboard so it can update placeId
        const created = await createPlace(formData);
        setSuccess("Place created successfully!");
        setPlace(created);
        if (onPlaceCreated) onPlaceCreated(created.id);
      }
      setIsEditing(false);
      fetchPlace();
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please check all fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    // Reset the form back to the saved place data
    if (place) {
      setFormData({
        name: place.name || "",
        category: place.category || "gallery",
        location: place.location || "",
        latitude: place.latitude || 27.7172,
        longitude: place.longitude || 85.324,
        description: place.description || "",
        phone: place.phone || "",
        website: place.website || "",
        email: place.email || "",
        operating_hours: place.operating_hours || "",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-stone-500">Loading place details...</div>
      </div>
    );
  }

  // Prompt shown if the creator hasn't created their place yet
  if (!place && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-gold-600" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          No Place Created Yet
        </h1>
        <p className="text-stone-500 mb-6 max-w-sm">
          Create your place to start showcasing your business to visitors on
          ArtMap.
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-3 bg-gold-400 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
        >
          Create My Place
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with place name badge and edit/save buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {place && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
                <span className="text-gold-600 font-bold text-sm">
                  {place.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-semibold text-stone-700">
                {place.name}
              </span>
              <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full capitalize">
                {place.category?.replace("_", " ")}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-1">
            Place Details
          </h1>
          <p className="text-stone-500 text-sm">
            Edit the information visitors see on your page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gold-400 text-white rounded-lg hover:bg-gold-500 transition-colors text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Error and success feedback */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Main form — inputs are read-only when not editing */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Place Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g., Siddhartha Art Gallery"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g., Baber Mahal Revisited, Kathmandu"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          {/* Coordinates for the map marker */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              placeholder="Describe your place — history, what visitors can expect, what makes it special..."
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="border-t border-stone-100 my-6" />

        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
          Contact & Hours
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-600" />
              Operating Hours
            </label>
            <input
              type="text"
              name="operating_hours"
              value={formData.operating_hours}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g., Tue-Sun 11am - 6pm"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1.5">
              <Phone className="w-3.5 h-3.5 text-gold-600" />
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g., +977 1-5544880"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-gold-600" />
              Website
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g., www.siddharthaartgallery.com"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-gold-600" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g., info@siddharthaartgallery.com"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm disabled:bg-stone-50 disabled:text-stone-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Quick link to preview the public page */}
      {place && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold-100 flex items-center justify-center">
              <Eye className="w-4 h-4 text-gold-600" />
            </div>
            <div>
              <p className="font-medium text-stone-900 text-sm">
                Public Page Preview
              </p>
              <p className="text-xs text-stone-500">
                See how your place appears to visitors
              </p>
            </div>
          </div>
          {/* Opens in a new tab with ?preview=true so the navbar shows "Back to Dashboard" */}
          <a
            href={`/places/${place.id}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors text-sm font-medium"
          >
            View Page
          </a>
        </div>
      )}
    </div>
  );
}
