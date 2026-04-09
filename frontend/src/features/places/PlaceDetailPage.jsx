// PlaceDetailPage.jsx
// The full detail page for a single art space.
// Shows a photo gallery, description, reviews (with CRUD for the author),
// tagged user posts, contact info sidebar, and a mini Leaflet map.
// Key decisions:
// - No hardcoded fallback image — Camera icon shown instead if no photos
// - Review photos sent as FormData using createReview
// - Toast notification for bookmark/share/review feedback
// - Bookmarking redirects to /login if the user is not logged in

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Star,
  ChevronLeft,
  Heart,
  Clock,
  Phone,
  Globe,
  MessageSquare,
  Camera,
  X,
  Edit2,
  Trash2,
  Mail,
  Check,
  Link,
} from "lucide-react";
import { getPlaceById } from "../../api/placesApi";
import {
  getPlaceReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../../api/reviewsApi";
import { toggleBookmark, checkBookmark } from "../../api/bookmarksApi";
import { getPlacePosts, getPlacePhotos } from "../../api/postsApi";
import { useAuth } from "../../hooks/useAuth";

// Fix Leaflet default icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom gold teardrop marker for the mini-map
const goldIcon = L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;background:white;border:3px solid #C9A961;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);">
    <div style="position:absolute;inset:4px;background:#C9A961;border-radius:50% 50% 50% 0;opacity:0.7;"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

// Small notification shown at the bottom of the screen after user actions
function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
      <Check className="w-4 h-4 text-gold-400" />
      {message}
    </div>
  );
}

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedRating, setEditedRating] = useState(5);

  // New review form state
  const [newReview, setNewReview] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    fetchPlaceData();
  }, [id]);
  useEffect(() => {
    if (user) checkIfBookmarked();
  }, [id, user]);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  const fetchPlaceData = async () => {
    try {
      const [placeData, reviewsData] = await Promise.all([
        getPlaceById(id),
        getPlaceReviews(id),
      ]);
      // Posts and photos can fail silently — they are optional
      try {
        setPosts(await getPlacePosts(id));
      } catch {
        setPosts([]);
      }
      try {
        setPhotos(await getPlacePhotos(id));
      } catch {
        setPhotos([]);
      }
      setPlace(placeData);
      setReviews(reviewsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfBookmarked = async () => {
    try {
      const result = await checkBookmark(id);
      setIsBookmarked(result.bookmarked);
    } catch {}
  };

  const handleBookmark = async () => {
    // Redirect unauthenticated users to login
    if (!user) {
      navigate("/login");
      return;
    }
    setBookmarkLoading(true);
    try {
      const result = await toggleBookmark(id);
      setIsBookmarked(result.bookmarked);
      showToast(result.bookmarked ? "Place saved!" : "Removed from bookmarks");
    } catch {
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = async () => {
    // Use native share sheet on mobile, copy URL to clipboard on desktop
    if (navigator.share) {
      try {
        await navigator.share({ title: place.name, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!");
    }
  };

  const handleViewOnMap = () => {
    if (place?.latitude && place?.longitude) {
      navigate(
        `/map?lat=${place.latitude}&lng=${place.longitude}&placeId=${place.id}&name=${encodeURIComponent(place.name)}`,
      );
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditedContent(review.comment);
    setEditedRating(review.rating);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditedContent("");
    setEditedRating(5);
  };

  const handleSaveEdit = async (reviewId) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("rating", editedRating);
      formData.append("comment", editedContent);
      const updated = await updateReview(reviewId, formData);
      setReviews(reviews.map((r) => (r.id === reviewId ? updated : r)));
      handleCancelEdit();
      showToast("Review updated!");
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (!user) {
      navigate("/login");
      return;
    }
    if (userRating === 0) {
      setReviewError("Please select a rating.");
      return;
    }
    if (!newReview.trim()) {
      setReviewError("Please write a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("rating", userRating);
      formData.append("comment", newReview);
      // Optional photo attachment
      if (selectedPhoto) formData.append("photo", selectedPhoto);
      const created = await createReview(id, formData);
      // Prepend the new review so it appears at the top
      setReviews([created, ...reviews]);
      setNewReview("");
      setUserRating(0);
      setSelectedPhoto(null);
      setPhotoPreview(null);
      showToast("Review submitted!");
    } catch (err) {
      setReviewError(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      showToast("Review deleted");
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-400" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-600 mb-4">Place not found</p>
          <button
            onClick={() => navigate("/explore")}
            className="px-6 py-3 bg-gold-400 text-white rounded-lg hover:bg-gold-500"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // Build image array from gallery photos, fall back to legacy image field.
  // No hardcoded Unsplash fallback — Camera placeholder shown instead if empty.
  const galleryImages =
    photos.length > 0
      ? photos.map((p) => p.photo_url).filter(Boolean)
      : place.image
        ? [place.image]
        : [];

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Toast message={toast.message} visible={toast.visible} />

      {/* Sticky back button */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Explore</span>
          </button>
        </div>
      </div>

      {/* Photo gallery — main large image + up to 4 thumbnails */}
      <div className="bg-stone-100/30 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-80 lg:h-[500px] rounded-2xl overflow-hidden bg-stone-200 flex items-center justify-center">
              {galleryImages.length > 0 ? (
                <img
                  src={galleryImages[activeImageIndex]}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-stone-400" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {galleryImages.length > 1
                ? galleryImages.slice(1, 5).map((img, index) => (
                    <div
                      key={index + 1}
                      onClick={() => setActiveImageIndex(index + 1)}
                      className={`h-36 lg:h-60 rounded-2xl overflow-hidden cursor-pointer transition-all hover:opacity-90 ${activeImageIndex === index + 1 ? "ring-2 ring-gold-400 ring-offset-2" : ""}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                : // Camera placeholder thumbnails when not enough photos
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-36 lg:h-60 rounded-2xl bg-stone-200 flex items-center justify-center"
                    >
                      <Camera className="w-8 h-8 text-stone-400" />
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left — description, reviews, posts */}
          <div className="lg:col-span-2">
            {/* Place header */}
            <div className="mb-12">
              <span className="inline-block px-3 py-1 bg-gold-100 text-gold-600 text-sm font-medium rounded-full mb-3 capitalize">
                {place.category?.replace("_", " ")}
              </span>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
                {place.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-stone-600 mb-6">
                {place.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>{place.location}</span>
                  </div>
                )}
                {avgRating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-gold-400 text-gold-400" />
                    <span className="font-semibold text-stone-900">
                      {avgRating}
                    </span>
                    <span className="text-stone-500">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all disabled:opacity-60 ${
                    isBookmarked
                      ? "bg-gold-50 border-gold-400 text-gold-600"
                      : "bg-white border-stone-300 text-stone-700 hover:border-gold-400 hover:text-gold-600"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isBookmarked ? "fill-gold-400 text-gold-400" : ""}`}
                  />
                  <span className="text-sm font-medium">
                    {bookmarkLoading ? "..." : isBookmarked ? "Saved" : "Save"}
                  </span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-stone-300 text-stone-700 rounded-xl hover:border-gold-400 hover:text-gold-600 transition-all"
                >
                  <Link className="w-5 h-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>

              {place.description && (
                <p className="text-stone-700 leading-relaxed text-lg">
                  {place.description}
                </p>
              )}
            </div>

            {/* Reviews section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-6 h-6 text-gold-600" />
                <h2 className="text-3xl font-serif font-bold text-stone-900">
                  Reviews & Ratings
                </h2>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4 mb-10">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      currentUser={user}
                      editingReviewId={editingReviewId}
                      editedContent={editedContent}
                      editedRating={editedRating}
                      setEditedContent={setEditedContent}
                      setEditedRating={setEditedRating}
                      onEdit={handleEditReview}
                      onSave={handleSaveEdit}
                      onCancel={handleCancelEdit}
                      onDelete={handleDeleteReview}
                      submitting={submitting}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center mb-10">
                  <p className="text-stone-500">
                    No reviews yet. Be the first to share your experience!
                  </p>
                </div>
              )}

              {/* Write a review form — only shown to logged-in users */}
              {user ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-8">
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">
                    Write a Review
                  </h3>
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-3">
                        Your rating:
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${star <= (hoverRating || userRating) ? "fill-gold-400 text-gold-400" : "fill-stone-200 text-stone-200"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Share your experience..."
                      rows={4}
                      className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none text-sm"
                    />
                    {reviewError && (
                      <p className="text-sm text-red-600">{reviewError}</p>
                    )}
                    {/* Photo preview with remove button */}
                    {photoPreview && (
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-28 h-28 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPhoto(null);
                            setPhotoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-gold-400 text-white rounded-xl font-medium hover:bg-gold-500 transition-colors disabled:opacity-50"
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </button>
                      <label className="px-5 py-3 border-2 border-stone-300 text-stone-700 rounded-xl cursor-pointer hover:border-stone-400 transition-colors flex items-center gap-2 text-sm">
                        <Camera className="w-4 h-4" />
                        Add Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
                  <p className="text-stone-600 mb-3">Want to leave a review?</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2.5 bg-gold-400 text-white rounded-xl font-medium hover:bg-gold-500 transition-colors"
                  >
                    Log in to review
                  </button>
                </div>
              )}
            </div>

            {/* Tagged user posts */}
            {posts.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <Camera className="w-6 h-6 text-gold-600" />
                  <h2 className="text-3xl font-serif font-bold text-stone-900">
                    Tagged Posts
                  </h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {posts.slice(0, 8).map((post) => (
                    <div
                      key={post.id}
                      className="aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      <div className="relative w-full h-full">
                        <img
                          src={post.photo_url || post.photo}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-3">
                          {post.user_name && (
                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              @{post.user_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar — info card + mini map */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            {/* Contact information card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-5">
                Information
              </h3>
              <div className="space-y-4">
                {place.operating_hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-0.5">
                        Hours
                      </p>
                      <p className="text-sm text-stone-700">
                        {place.operating_hours}
                      </p>
                    </div>
                  </div>
                )}
                {place.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-0.5">
                        Phone
                      </p>
                      <a
                        href={`tel:${place.phone}`}
                        className="text-sm text-stone-700 hover:text-gold-600 transition-colors"
                      >
                        {place.phone}
                      </a>
                    </div>
                  </div>
                )}
                {place.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-0.5">
                        Website
                      </p>
                      <a
                        href={
                          place.website.startsWith("http")
                            ? place.website
                            : `https://${place.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gold-600 hover:text-gold-700 transition-colors break-all"
                      >
                        {place.website}
                      </a>
                    </div>
                  </div>
                )}
                {place.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-0.5">
                        Email
                      </p>
                      <a
                        href={`mailto:${place.email}`}
                        className="text-sm text-gold-600 hover:text-gold-700 transition-colors"
                      >
                        {place.email}
                      </a>
                    </div>
                  </div>
                )}
                {!place.operating_hours &&
                  !place.phone &&
                  !place.website &&
                  !place.email && (
                    <p className="text-sm text-stone-400 italic">
                      No contact info provided yet.
                    </p>
                  )}
              </div>
            </div>

            {/* Mini map + View on ArtMap button */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-4">
                Location
              </h3>
              {place.latitude && place.longitude ? (
                <>
                  <div
                    className="rounded-xl overflow-hidden mb-4"
                    style={{ height: 200 }}
                  >
                    {/* Mini-map is non-interactive — just a visual reference */}
                    <MapContainer
                      center={[place.latitude, place.longitude]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                      scrollWheelZoom={false}
                      dragging={false}
                      doubleClickZoom={false}
                      touchZoom={false}
                      attributionControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[place.latitude, place.longitude]}
                        icon={goldIcon}
                      >
                        <Popup>
                          <p className="font-semibold text-sm">{place.name}</p>
                          {place.location && (
                            <p className="text-xs text-stone-500">
                              {place.location}
                            </p>
                          )}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  {/* Opens the full MapPage with this place focused */}
                  <button
                    onClick={handleViewOnMap}
                    className="w-full py-3 bg-gold-400 text-white rounded-xl font-medium hover:bg-gold-500 transition-colors text-sm"
                  >
                    View on ArtMap
                  </button>
                </>
              ) : (
                <div className="h-48 bg-stone-100 rounded-xl flex flex-col items-center justify-center text-stone-400">
                  <MapPin className="w-8 h-8 mb-2" />
                  <span className="text-xs">No location set</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual review card — shows edit/delete controls to the review's author
function ReviewCard({
  review,
  currentUser,
  editingReviewId,
  editedContent,
  editedRating,
  setEditedContent,
  setEditedRating,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  submitting,
}) {
  // Match by username since we don't expose the user ID in the review serializer
  const isAuthor = currentUser && review.user_name === currentUser.username;
  const isEditing = editingReviewId === review.id;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gold-600 font-semibold">
              {review.user_name ? review.user_name[0].toUpperCase() : "?"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-stone-900">
              {review.user_name || "Anonymous"}
            </p>
            <p className="text-xs text-stone-500">
              {new Date(review.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        {isAuthor && !isEditing && (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(review)}
              className="p-2 text-stone-400 hover:text-gold-600 transition-colors rounded-lg hover:bg-gold-50"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(review.id)}
              className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setEditedRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${star <= editedRating ? "fill-gold-400 text-gold-400" : "fill-stone-200 text-stone-200"}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onSave(review.id)}
              disabled={submitting}
              className="px-5 py-2 bg-gold-400 text-white rounded-lg hover:bg-gold-500 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-5 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= review.rating ? "fill-gold-400 text-gold-400" : "fill-stone-200 text-stone-200"}`}
              />
            ))}
          </div>
          <p className="text-stone-700 leading-relaxed text-sm">
            {review.comment}
          </p>
          {/* Photo attached to the review */}
          {review.photo && (
            <img
              src={review.photo}
              alt="Review"
              className="mt-4 w-full max-w-xs rounded-xl object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
}
