// MyProfile.jsx
// The profile section of the creator dashboard.
// Shows and lets the creator edit their bio, contact info, and social links.
// Note: Phone and website are stored on the Place model, not CreatorProfile,
// so we read them from the place data first and fall back to the profile.

import { useState, useEffect } from "react";
import { Edit2, Mail, Phone, MapPin, Globe, CheckCircle } from "lucide-react";
import { getCreatorProfile, getCreatorPlaces } from "../../../api/creatorApi";
import api from "../../../api/axiosConfig";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [place, setPlace] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  // Shows a green success banner for 3 seconds after saving
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileData, places, userInfo] = await Promise.all([
        getCreatorProfile(),
        getCreatorPlaces(),
        api
          .get("/auth/user/")
          .then((r) => r.data)
          .catch(() => null),
      ]);
      setProfile(profileData);
      const currentPlace = places.length > 0 ? places[0] : null;
      if (currentPlace) setPlace(currentPlace);
      setUser(userInfo);

      // Phone and website live on the Place model, not CreatorProfile.
      // We try the place first, then fall back to the creator profile fields.
      setForm({
        bio: profileData?.business_description || "",
        phone: currentPlace?.phone || profileData?.phone || "",
        website: currentPlace?.website || profileData?.website || "",
        instagram: profileData?.instagram || "",
        facebook: profileData?.facebook || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/creator/profile/", {
        business_description: form.bio,
        phone: form.phone,
        website: form.website,
      });
      setSaved(true);
      setEditing(false);
      // Hide the success banner after 3 seconds
      setTimeout(() => setSaved(false), 3000);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-400" />
      </div>
    );
  }

  // Use the first letter of the business name as the avatar initial
  const avatar = profile?.business_name?.[0]?.toUpperCase() || "C";

  const memberSince = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-1">
            My Profile
          </h1>
          <p className="text-stone-500 text-sm">
            Manage your personal information and preferences.
          </p>
        </div>
        {/* Toggle between view mode and edit mode */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-gold-400 text-white rounded-lg hover:bg-gold-500 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Success banner */}
      {saved && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm mb-4">
        <div className="flex items-start gap-5">
          {/* Avatar — initials only, no photo upload needed */}
          <div className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-gold-600">{avatar}</span>
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Bio / Description
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell visitors about yourself..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">
                      Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+977 98XXXXXXXX"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">
                      Website
                    </label>
                    <input
                      value={form.website}
                      onChange={(e) =>
                        setForm({ ...form, website: e.target.value })
                      }
                      placeholder="www.yourwebsite.com"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-stone-900 mb-0.5">
                  {profile?.business_name || user?.username}
                </h2>
                <p className="text-sm text-stone-500 mb-3 capitalize">
                  {profile?.category?.replace(/_/g, " ")} Owner
                </p>
                {form.bio && (
                  <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                    {form.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {user?.email || "—"}
                  </span>
                  {form.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      {form.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Kathmandu, Nepal
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm mb-4">
        <h3 className="font-semibold text-stone-900 mb-1">Social Links</h3>
        <p className="text-sm text-stone-500 mb-4">
          Connect your social media accounts.
        </p>
        {editing ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                key: "instagram",
                label: "Instagram",
                placeholder: "@yourhandle",
              },
              {
                key: "facebook",
                label: "Facebook",
                placeholder: "YourPageName",
              },
              {
                key: "website",
                label: "Website",
                placeholder: "www.yoursite.com",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  {label}
                </label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Instagram", value: form.instagram },
              { label: "Facebook", value: form.facebook },
              { label: "Website", value: form.website },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl"
              >
                <Globe className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-stone-400">{label}</p>
                  {value ? (
                    <a
                      href={
                        label === "Website"
                          ? value.startsWith("http")
                            ? value
                            : `https://${value}`
                          : label === "Instagram"
                            ? `https://instagram.com/${value.replace("@", "")}`
                            : `https://facebook.com/${value}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gold-600 hover:text-gold-700 truncate block"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-stone-400">
                      Not set
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Information — read only */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-4">
          Account Information
        </h3>
        <div className="divide-y divide-stone-100">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-stone-500">Member Since</span>
            <span className="text-sm font-semibold text-stone-900">
              {memberSince}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-stone-500">Account Status</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-50 text-gold-700 border border-gold-200 rounded-full text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Creator
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-stone-500">Associated Place</span>
            <span className="text-sm font-semibold text-stone-900">
              {place?.name || "No place yet"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-stone-500">Username</span>
            <span className="text-sm font-semibold text-stone-900">
              {user?.username || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
