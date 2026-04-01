import api from "./axiosConfig";

export const getPlaceReviews = async (placeId) => {
  const response = await api.get(`/places/${placeId}/reviews/`);
  return response.data;
};

export const createReview = async (placeId, formData) => {
  const response = await api.post(`/places/${placeId}/reviews/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateReview = async (reviewId, formData) => {
  const response = await api.put(`/reviews/${reviewId}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}/`);
  return response.data;
};
