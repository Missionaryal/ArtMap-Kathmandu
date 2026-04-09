// ProfilePage.jsx
// The logged-in user's personal profile page.
// Shows their posts (Instagram-style grid) and saved bookmarks.
// Includes an Edit Profile modal (username + profile picture)
// and a Create Post modal (photo upload + place tagging + visibility toggle).

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getUserBookmarks } from "../../api/bookmarksApi";
import { getAllPlaces } from "../../api/placesApi";
import { createPost, getUserPosts, deletePost } from "../../api/postsApi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import {
  Camera,
  MapPin,
  Grid3x3,
  Bookmark,
  Clock,
  AlertTriangle,
  Plus,
  X,
  Upload,
  Lock,
  Globe,
  Trash2,
  Image,
  Search,
} from "lucide-react";

// Modal for editing username and profile picture
function EditProfileModal({ user, onClose, onSaved }) {
  const [username, setUsername] = useState(user.username || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(user.profile_picture || null);
  // True when the user wants to delete their current photo
  const [removePhoto, setRemovePhoto] = useState(false);
  const picInputRef = useRef();

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setRemovePhoto(false);
    const reader = new FileReader();
    reader.onloadend = () => setPicPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPicFile(null);
    setPicPreview(null);
    setRemovePhoto(true);
  };

  const handleSave = async () => {
    setError("");
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    setSaving(true);
    try {
      let newProfilePicture = user.profile_picture;
      // Upload new photo if one was selected
      if (picFile) {
        const formData = new FormData();
        formData.append("profile_picture", picFile);
        const res = await api.post("/auth/user/profile-picture/", formData);
        newProfilePicture = res.data.profile_picture;
      }
      // Delete existing photo if requested
      if (removePhoto) {
        await api.delete("/auth/user/profile-picture/").catch(() => {});
        newProfilePicture = null;
      }
      const res = await api.patch("/auth/user/update/", { username });
      // Pass updated fields back to the parent so AuthContext stays in sync
      onSaved({
        username: res.data.username,
        profile_picture: newProfilePicture,
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.username?.[0] || "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-serif font-bold text-stone-900 text-lg">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gold-400 flex items-center justify-center flex-shrink-0">
                {picPreview ? (
                  <img
                    src={picPreview}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {username[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <button
                  onClick={() => picInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 text-sm font-medium"
                >
                  <Camera className="w-4 h-4" />
                  {picPreview ? "Change Photo" : "Upload Photo"}
                </button>
                {picPreview && (
                  <button
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Remove Photo
                  </button>
                )}
                <p className="text-xs text-stone-400">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
              <input
                ref={picInputRef}
                type="file"
                accept="image/*"
                onChange={handlePicChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="border-t border-stone-100" />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Email
            </label>
            {/* Email is read-only — changing it would require re-verification */}
            <input
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-sm bg-stone-50 text-stone-400"
            />
            <p className="text-xs text-stone-400 mt-1">
              Email cannot be changed
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-gold-400 text-white rounded-xl text-sm font-medium hover:bg-gold-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Two-step modal for creating a new post:
// Step 1 — upload or drag-drop a photo
// Step 2 — add caption, tag a place, set visibility (Public/Private)
function CreatePostModal({ onClose, onPostCreated }) {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeSearch, setPlaceSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  // Load all places for the tagging search
  useEffect(() => {
    getAllPlaces().then(setPlaces).catch(console.error);
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
    // Advance to step 2 automatically once a photo is selected
    setStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
    setStep(2);
  };

  const handleSubmit = async () => {
    setError("");
    if (!photo) {
      setError("Please select a photo.");
      return;
    }
    // A place tag is required so the post shows up on the right place page
    if (!selectedPlace) {
      setError("Please select a place to tag.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("caption", caption);
      formData.append("place", selectedPlace.id);
      formData.append("is_public", isPublic ? "true" : "false");
      await createPost(formData);
      onPostCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlaces = places.filter((p) =>
    p.name.toLowerCase().includes(placeSearch.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="font-serif font-bold text-stone-900 text-lg">
            {step === 1 ? "Create New Post" : "Post Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1 — drag-and-drop or file picker */}
        {step === 1 && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="m-6 border-2 border-dashed border-stone-300 hover:border-gold-400 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors group"
          >
            <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4 group-hover:bg-gold-200">
              <Upload className="w-8 h-8 text-gold-600" />
            </div>
            <p className="font-semibold text-stone-900 mb-1">
              Drag & drop your photo here
            </p>
            <p className="text-sm text-stone-500 mb-4">or click to browse</p>
            <span className="px-4 py-2 bg-gold-400 text-white rounded-lg text-sm font-medium">
              Select Photo
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        )}

        {/* Step 2 — caption, place tag, visibility */}
        {step === 2 && (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 flex-shrink-0 bg-stone-100">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[500px]">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Tag a Place <span className="text-red-400">*</span>
                </label>
                {/* Show the selected place, or a search input if none selected yet */}
                {selectedPlace ? (
                  <div className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-200 rounded-xl">
                    <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-stone-900 flex-1">
                      {selectedPlace.name}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPlace(null);
                        setPlaceSearch("");
                      }}
                    >
                      <X className="w-4 h-4 text-stone-400" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={placeSearch}
                        onChange={(e) => setPlaceSearch(e.target.value)}
                        placeholder="Search for a place..."
                        className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
                      />
                    </div>
                    {placeSearch && (
                      <div className="border border-stone-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                        {filteredPlaces.length > 0 ? (
                          filteredPlaces.map((place) => (
                            <button
                              key={place.id}
                              onClick={() => {
                                setSelectedPlace(place);
                                setPlaceSearch("");
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gold-50 text-left border-b border-stone-100 last:border-0"
                            >
                              <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-stone-900">
                                  {place.name}
                                </p>
                                <p className="text-xs text-stone-500 capitalize">
                                  {place.category} · {place.location}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-stone-500">
                            No places found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Visibility
                </label>
                <div className="flex gap-3">
                  {[
                    { val: true, icon: Globe, label: "Public" },
                    { val: false, icon: Lock, label: "Private" },
                  ].map(({ val, icon: Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setIsPublic(val)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${isPublic === val ? "border-gold-400 bg-gold-50 text-gold-700" : "border-stone-200 text-stone-600"}`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setStep(1);
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50"
                >
                  Change Photo
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gold-400 text-white rounded-xl text-sm font-medium hover:bg-gold-500 disabled:opacity-50"
                >
                  {submitting ? "Sharing..." : "Share Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main profile page component
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [bookmarks, setBookmarks] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch bookmarks only when the user switches to the Bookmarks tab
  useEffect(() => {
    if (activeTab === "bookmarks") fetchBookmarks();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      setPosts(await getUserPosts());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchBookmarks = async () => {
    setLoadingBookmarks(true);
    try {
      setBookmarks(await getUserBookmarks());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(postId);
      // Remove from local state without refetching
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  // Redirect unauthenticated users to login
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={() => {
            fetchPosts();
            setActiveTab("posts");
          }}
        />
      )}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSaved={({ username, profile_picture }) => {
            // Update AuthContext so the Navbar also shows the new username
            if (setUser) setUser({ ...user, username, profile_picture });
            setShowEditModal(false);
          }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Warning banner for pending creators — shown until the admin approves them */}
        {user.is_creator && user.creator_status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-1 font-serif">
                Creator Application Pending
              </h3>
              <p className="text-amber-700 text-sm">
                Your application for{" "}
                <strong>{user.business_name || "your art space"}</strong> is
                being reviewed. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        )}

        {/* Error banner for rejected creator applications */}
        {user.is_creator && user.creator_status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-1 font-serif">
                Application Not Approved
              </h3>
              <p className="text-red-700 text-sm">
                Contact{" "}
                <a
                  href="mailto:support@artmap.com"
                  className="underline font-semibold"
                >
                  support@artmap.com
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gold-400 flex items-center justify-center flex-shrink-0">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-serif font-bold text-white">
                  {user.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-serif font-bold text-stone-900 mb-1">
                {user.username}
              </h1>
              <p className="text-stone-500 mb-4">{user.email}</p>
              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-2xl font-bold text-stone-900">
                    {posts.length}
                  </p>
                  <p className="text-sm text-stone-500">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-900">
                    {bookmarks.length}
                  </p>
                  <p className="text-sm text-stone-500">Bookmarks</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-2 border-2 border-gold-400 text-gold-400 font-semibold rounded-lg hover:bg-gold-50 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-gold-400 text-white font-semibold rounded-lg hover:bg-gold-500 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts / Bookmarks tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="border-b border-stone-200">
            <div className="flex">
              {[
                { id: "posts", icon: Grid3x3, label: "Posts" },
                { id: "bookmarks", icon: Bookmark, label: "Bookmarks" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === id ? "text-gold-400 border-b-2 border-gold-400" : "text-stone-500 hover:text-stone-700"}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Posts tab — Instagram-style 3-column grid */}
            {activeTab === "posts" &&
              (loadingPosts ? (
                <div className="flex justify-center py-16">
                  <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="relative aspect-square group overflow-hidden"
                    >
                      <img
                        src={post.photo_url}
                        alt={post.caption || "Post"}
                        className="w-full h-full object-cover"
                      />
                      {/* Hover overlay shows caption, place name, and delete button */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        {post.caption && (
                          <p className="text-white text-xs text-center line-clamp-2">
                            {post.caption}
                          </p>
                        )}
                        {post.place_name && (
                          <div className="flex items-center gap-1 text-white/80 text-xs">
                            <MapPin className="w-3 h-3" />
                            {post.place_name}
                          </div>
                        )}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="mt-1 p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
                    <Image className="w-10 h-10 text-stone-400" />
                  </div>
                  <p className="text-stone-600 text-lg mb-2">No posts yet</p>
                  <p className="text-stone-400 text-sm mb-6">
                    Share your art discoveries with the community!
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gold-400 text-white font-semibold rounded-lg hover:bg-gold-500 mx-auto"
                  >
                    <Plus className="w-4 h-4" /> Create Your First Post
                  </button>
                </div>
              ))}

            {/* Bookmarks tab — 2-column card grid */}
            {activeTab === "bookmarks" &&
              (loadingBookmarks ? (
                <div className="flex justify-center py-16">
                  <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : bookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookmarks.map((place) => {
                    const imageSrc =
                      place.photos?.[0]?.photo_url || place.image || null;
                    return (
                      <div
                        key={place.id}
                        onClick={() => navigate(`/places/${place.id}`)}
                        className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <div className="h-48 bg-stone-100">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={place.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-stone-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">
                            {place.name}
                          </h3>
                          <div className="flex items-center gap-2 text-stone-600 text-sm mb-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{place.location || "Kathmandu"}</span>
                          </div>
                          <span className="inline-block px-3 py-1 bg-gold-50 text-gold-600 text-xs font-semibold rounded-full capitalize">
                            {place.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
                    <Bookmark className="w-10 h-10 text-stone-400" />
                  </div>
                  <p className="text-stone-600 text-lg mb-4">
                    No bookmarks yet. Start exploring!
                  </p>
                  <button
                    onClick={() => navigate("/explore")}
                    className="px-6 py-3 bg-gold-400 text-white font-semibold rounded-lg hover:bg-gold-500"
                  >
                    Explore Places
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
