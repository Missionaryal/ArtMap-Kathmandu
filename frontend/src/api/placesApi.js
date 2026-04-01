import api from "./axiosConfig";

// Get all places with optional filters
export const getPlaces = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);

  const response = await api.get(`/places/?${params.toString()}`);
  return response.data;
};

// Get single place by ID
export const getPlaceById = async (id) => {
  const response = await api.get(`/places/${id}/`);
  return response.data;
};

// Legacy export
export const getAllPlaces = getPlaces;
