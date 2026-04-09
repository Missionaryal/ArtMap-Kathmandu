// creatorApi.js
// Functions for the creator dashboard — managing profiles, places, photos, and reviews.
// All endpoints here require the user to be logged in as an approved creator.

import api from "./axiosConfig";

// GET /api/creator/profile/ — fetch the creator's own profile info
export const getCreatorProfile = async () => {
  const response = await api.get("/creator/profile/");
  return response.data;
};

// PUT /api/creator/profile/ — update the creator's profile (bio, category, etc.)
export const updateCreatorProfile = async (data) => {
  const response = await api.put("/creator/profile/", data);
  return response.data;
};

// GET /api/creator/places/ — get all places belonging to this creator
export const getCreatorPlaces = async () => {
  const response = await api.get("/creator/places/");
  return response.data;
};

// POST /api/creator/places/create/ — add a new cultural place
export const createPlace = async (formData) => {
  const response = await api.post("/creator/places/create/", formData);
  return response.data;
};

// PUT /api/creator/places/<id>/update/ — update an existing place
export const updatePlace = async (placeId, formData) => {
  const response = await api.put(
    `/creator/places/${placeId}/update/`,
    formData,
  );
  return response.data;
};

// POST /api/creator/places/<id>/photos/ — upload a new photo to a place's gallery
// Uses FormData so the image file is sent as multipart/form-data
export const uploadPlacePhoto = async (placeId, formData) => {
  const response = await api.post(
    `/creator/places/${placeId}/photos/`,
    formData,
  );
  return response.data;
};

// DELETE /api/creator/photos/<id>/delete/ — remove a photo from a place's gallery
export const deletePlacePhoto = async (photoId) => {
  const response = await api.delete(`/creator/photos/${photoId}/delete/`);
  return response.data;
};

// GET /api/creator/reviews/ — get all reviews left at this creator's places
export const getCreatorReviews = async () => {
  const response = await api.get("/creator/reviews/");
  return response.data;
};

// GET /api/creator/tagged-posts/ — get posts that users tagged at this creator's places
export const getCreatorTaggedPosts = async () => {
  const response = await api.get("/creator/tagged-posts/");
  return response.data;
};

// GET /api/creator/stats/ — get dashboard summary numbers (total places, reviews, etc.)
export const getCreatorStats = async () => {
  const response = await api.get("/creator/stats/");
  return response.data;
};
