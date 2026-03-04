import api from "./axiosConfig";

// Get all places
export const getAllPlaces = async () => {
  const response = await api.get("/places/");
  return response.data;
};

// Get place by ID
export const getPlaceById = async (id) => {
  const response = await api.get(`/places/${id}/`);
  return response.data;
};

// Get places by category
export const getPlacesByCategory = async (category) => {
  const response = await api.get(`/places/?category=${category}`);
  return response.data;
};
