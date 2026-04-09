// reviewsApi.js
// Functions for reading and writing place reviews.

import api from "./axiosConfig";

// GET /api/places/<id>/reviews/ — get all reviews for a specific place
export const getPlaceReviews = async (placeId) => {
  const response = await api.get(`/places/${placeId}/reviews/`);
  return response.data;
};

// POST /api/places/<id>/reviews/ — submit a new review for a place
// Sends as FormData because it may include an optional photo
// Note: Do NOT set Content-Type manually here — axiosConfig.js detects
// FormData automatically and sets the correct multipart boundary
export const createReview = async (placeId, formData) => {
  const response = await api.post(`/places/${placeId}/reviews/`, formData);
  return response.data;
};

// PUT /api/reviews/<id>/ — edit an existing review (only the author can do this)
export const updateReview = async (reviewId, formData) => {
  const response = await api.put(`/reviews/${reviewId}/`, formData);
  return response.data;
};

// DELETE /api/reviews/<id>/ — delete a review (only the author can do this)
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}/`);
  return response.data;
};
