import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getUserBookmarks } from "../../api/bookmarksApi";
import { getCreatorPlaces, getCreatorStats } from "../../api/creatorApi";
import { getAllPlaces } from "../../api/placesApi";
import { createPost, getUserPosts, deletePost } from "../../api/postsApi";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  Grid3x3,
  Bookmark,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Eye,
  MessageSquare,
  LayoutDashboard,
  ExternalLink,
  Plus,
  X,
  Upload,
  Lock,
  Globe,
  Trash2,
  Image,
  Search,
} from "lucide-react";

// ─── Create Post Modal ────────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const data = await getAllPlaces();
      setPlaces(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
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
      // Send as string "true"/"false" — backend handles conversion
      formData.append("is_public", isPublic ? "true" : "false");

      await createPost(formData);
      onPostCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Failed to create post. Try again.",
      );
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="font-serif font-bold text-stone-900 text-lg">
            {step === 1 ? "Create New Post" : "Post Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Upload Photo */}
        {step === 1 && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="m-6 border-2 border-dashed border-stone-300 hover:border-gold-400 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors group"
          >
            <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4 group-hover:bg-gold-200 transition-colors">
              <Upload className="w-8 h-8 text-gold-600" />
            </div>
            <p className="font-semibold text-stone-900 mb-1">
              Drag & drop your photo here
            </p>
            <p className="text-sm text-stone-500 mb-4">or click to browse</p>
            <span className="px-4 py-2 bg-gold-400 text-white rounded-lg text-sm font-medium hover:bg-gold-500 transition-colors">
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

        {/* Step 2: Post Details */}
        {step === 2 && (
          <div className="flex flex-col md:flex-row">
            {/* Photo Preview */}
            <div className="md:w-64 flex-shrink-0 bg-stone-100">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-64 md:h-full object-cover"
              />
            </div>

            {/* Details Form */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[500px]">
              {/* Caption */}
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

              {/* Place Tag */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Tag a Place <span className="text-red-400">*</span>
                </label>
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
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
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
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gold-50 transition-colors text-left border-b border-stone-100 last:border-0"
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

              {/* Visibility Toggle */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Visibility
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                      isPublic
                        ? "border-gold-400 bg-gold-50 text-gold-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                      !isPublic
                        ? "border-gold-400 bg-gold-50 text-gold-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    Private
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-1.5">
                  {isPublic
                    ? "Visible to everyone on the place page"
                    : "Only visible to you on your profile"}
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gold-400 text-white rounded-xl text-sm font-medium hover:bg-gold-500 transition-colors disabled:opacity-50"
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

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [bookmarks, setBookmarks] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [creatorPlace, setCreatorPlace] = useState(null);
  const [creatorStats, setCreatorStats] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeTab === "bookmarks") fetchBookmarks();
  }, [activeTab]);

  useEffect(() => {
    if (user?.is_creator && user?.creator_status === "approved") {
      fetchCreatorData();
    }
  }, [user]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await getUserPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchBookmarks = async () => {
    setLoadingBookmarks(true);
    try {
      const data = await getUserBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const fetchCreatorData = async () => {
    try {
      const [places, stats] = await Promise.all([
        getCreatorPlaces(),
        getCreatorStats(),
      ]);
      if (places.length > 0) setCreatorPlace(places[0]);
      setCreatorStats(stats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Creator Status Banners */}
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

        {/* Creator Business Card */}
        {user.is_creator && user.creator_status === "approved" && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-gold-600">
                    {user.business_name?.[0]?.toUpperCase() || "C"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-stone-900 text-lg">
                      {user.business_name}
                    </h3>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">Art Space Creator</p>
                </div>
              </div>
              <div className="flex gap-2">
                {creatorPlace && (
                  <button
                    onClick={() =>
                      window.open(`/places/${creatorPlace.id}`, "_blank")
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors text-xs font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Place
                  </button>
                )}
                <button
                  onClick={() => navigate("/creator")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-400 text-white rounded-lg hover:bg-gold-500 transition-colors text-xs font-medium"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </button>
              </div>
            </div>

            {creatorPlace ? (
              <div className="bg-stone-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-stone-200 overflow-hidden flex-shrink-0">
                    {creatorPlace.photos?.[0]?.photo_url ? (
                      <img
                        src={creatorPlace.photos[0].photo_url}
                        alt={creatorPlace.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-stone-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-stone-900">
                      {creatorPlace.name}
                    </p>
                    <p className="text-xs text-stone-500 capitalize mb-1">
                      {creatorPlace.category?.replace("_", " ")}
                    </p>
                    {creatorPlace.location && (
                      <div className="flex items-center gap-1 text-xs text-stone-400">
                        <MapPin className="w-3 h-3" />
                        {creatorPlace.location}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                      <span className="font-bold text-stone-900 text-sm">
                        {creatorPlace.average_rating > 0
                          ? creatorPlace.average_rating
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">
                      {creatorPlace.review_count || 0} reviews
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 rounded-xl p-4 mb-5 text-center">
                <p className="text-sm text-stone-500">
                  No place created yet.{" "}
                  <button
                    onClick={() => navigate("/creator")}
                    className="text-gold-600 font-medium hover:underline"
                  >
                    Create your place →
                  </button>
                </p>
              </div>
            )}

            {creatorStats && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Places",
                    value: creatorStats.total_places,
                    icon: MapPin,
                  },
                  {
                    label: "Photos",
                    value: creatorStats.total_photos,
                    icon: Camera,
                  },
                  {
                    label: "Reviews",
                    value: creatorStats.total_reviews,
                    icon: MessageSquare,
                  },
                  {
                    label: "Posts",
                    value: creatorStats.total_posts,
                    icon: Eye,
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-white border border-stone-200 rounded-xl p-3 text-center"
                    >
                      <Icon className="w-4 h-4 text-gold-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-stone-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-stone-500">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 bg-gold-400 rounded-full flex items-center justify-center">
                <span className="text-4xl font-serif font-bold text-white">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border-2 border-stone-200 hover:border-gold-400 transition-colors">
                <Camera className="w-4 h-4 text-stone-600" />
              </button>
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
                <button className="px-6 py-2 border-2 border-gold-400 text-gold-400 font-semibold rounded-lg hover:bg-gold-50 transition-colors">
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-gold-400 text-white font-semibold rounded-lg hover:bg-gold-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="border-b border-stone-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "posts"
                    ? "text-gold-400 border-b-2 border-gold-400"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
                Posts
              </button>
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "bookmarks"
                    ? "text-gold-400 border-b-2 border-gold-400"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <Bookmark className="w-5 h-5" />
                Bookmarks
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div>
                {loadingPosts ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-stone-600">Loading posts...</p>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="relative aspect-square group overflow-hidden"
                      >
                        {/* ← KEY FIX: use photo_url for display */}
                        <img
                          src={post.photo_url}
                          alt={post.caption || "Post"}
                          className="w-full h-full object-cover"
                        />
                        {/* Hover overlay */}
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
                          <div className="flex items-center gap-1 text-white/60 text-xs">
                            {post.is_public ? (
                              <>
                                <Globe className="w-3 h-3" />
                                Public
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                Private
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="mt-1 p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                      className="flex items-center gap-2 px-6 py-3 bg-gold-400 text-white font-semibold rounded-lg hover:bg-gold-500 transition-colors mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Post
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === "bookmarks" && (
              <div>
                {loadingBookmarks ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-stone-600">Loading bookmarks...</p>
                  </div>
                ) : bookmarks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookmarks.map((place) => {
                      const imageSrc =
                        place.photos?.[0]?.photo_url ||
                        place.image ||
                        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop";
                      return (
                        <div
                          key={place.id}
                          onClick={() => navigate(`/places/${place.id}`)}
                          className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                          <div className="h-48 bg-stone-100">
                            <img
                              src={imageSrc}
                              alt={place.name}
                              className="w-full h-full object-cover"
                            />
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
                      className="px-6 py-3 bg-gold-400 text-white font-semibold rounded-lg hover:bg-gold-500 transition-colors"
                    >
                      Explore Places
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
