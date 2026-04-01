import { Upload, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getCreatorPlaces,
  uploadPlacePhoto,
  deletePlacePhoto,
} from "../../../api/creatorApi";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const places = await getCreatorPlaces();
      if (places.length > 0) {
        setPlace(places[0]);
        setImages(places[0].photos || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !place) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("caption", "");

    setUploading(true);
    try {
      await uploadPlacePhoto(place.id, formData);
      await fetchGallery();
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (photoId) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await deletePlacePhoto(photoId);
      await fetchGallery();
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-400" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          No Place Created Yet
        </h1>
        <p className="text-stone-500">
          Create your place first in Place Details, then upload photos here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-1">
            Gallery
          </h1>
          <p className="text-stone-500 text-sm">
            Manage photos displayed on your page.
          </p>
        </div>
        <label
          className={`flex items-center gap-2 px-4 py-2 bg-gold-400 text-white rounded-lg hover:bg-gold-500 transition-colors cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <Upload className="w-4 h-4" />
          <span className="font-medium text-sm">
            {uploading ? "Uploading..." : "Upload Photos"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group"
            >
              <img
                src={image.photo_url}
                alt={image.caption || "Gallery photo"}
                className="w-full h-full object-cover"
              />

              {/* Cover Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-gold-400 text-white text-xs font-medium rounded">
                  Cover
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="w-9 h-9 rounded-lg bg-white text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add More Placeholder */}
          <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-gold-400 transition-colors flex flex-col items-center justify-center cursor-pointer group">
            <Plus className="w-8 h-8 text-stone-400 group-hover:text-gold-400 mb-2" />
            <span className="text-sm font-medium text-stone-500 group-hover:text-gold-400">
              Add Photo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="border-2 border-dashed border-stone-300 rounded-xl p-16 text-center">
          <Upload className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-2 font-medium">No photos yet</p>
          <p className="text-stone-400 text-sm mb-6">
            Upload photos to showcase your place to visitors
          </p>
          <label className="px-6 py-3 bg-gold-400 text-white rounded-lg hover:bg-gold-500 transition-colors cursor-pointer font-medium text-sm">
            Upload First Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      <p className="text-xs text-stone-400 mt-4">
        Recommended: High-quality images (1200x800px minimum). Max file size:
        5MB. The first photo will be used as the cover image.
      </p>
    </div>
  );
}
