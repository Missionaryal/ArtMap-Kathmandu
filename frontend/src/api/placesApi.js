// placesApi.js
// Functions for fetching cultural places from the API.

import api from "./axiosConfig";

// GET /api/places/ — get all places, with optional category or search filters
// Example: getPlaces({ category: 'thangka' }) returns only thangka places
export const getPlaces = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);

  const response = await api.get(`/places/?${params.toString()}`);
  return response.data;
};

// GET /api/places/<id>/ — get full details for a single place by its ID
export const getPlaceById = async (id) => {
  const response = await api.get(`/places/${id}/`);
  return response.data;
};

// Alias kept for backwards compatibility with older parts of the codebase
export const getAllPlaces = getPlaces;
