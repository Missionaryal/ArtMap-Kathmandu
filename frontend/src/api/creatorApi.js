import api from "./axiosConfig";

// Get creator profile
export const getCreatorProfile = async () => {
  const response = await api.get("/creator/profile/");
  return response.data;
};

// Update creator profile
export const updateCreatorProfile = async (data) => {
  const response = await api.put("/creator/profile/", data);
  return response.data;
};

// Get creator's places
export const getCreatorPlaces = async () => {
  const response = await api.get("/creator/places/");
  return response.data;
};

// Create new place
export const createPlace = async (formData) => {
  const response = await api.post("/creator/places/create/", formData);
  return response.data;
};

// Update place
export const updatePlace = async (placeId, formData) => {
  const response = await api.put(
    `/creator/places/${placeId}/update/`,
    formData,
  );
  return response.data;
};

// Upload place photo
export const uploadPlacePhoto = async (placeId, formData) => {
  const response = await api.post(
    `/creator/places/${placeId}/photos/`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

// Delete place photo
export const deletePlacePhoto = async (photoId) => {
  const response = await api.delete(`/creator/photos/${photoId}/delete/`);
  return response.data;
};

// Get reviews for creator's places
export const getCreatorReviews = async () => {
  const response = await api.get("/creator/reviews/");
  return response.data;
};

// Get posts tagged to creator's places
export const getCreatorTaggedPosts = async () => {
  const response = await api.get("/creator/tagged-posts/");
  return response.data;
};

// Get creator stats
export const getCreatorStats = async () => {
  const response = await api.get("/creator/stats/");
  return response.data;
};
