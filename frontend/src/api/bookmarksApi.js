// bookmarksApi.js
// Functions for saving and managing bookmarked places.

import api from "./axiosConfig";

// POST /api/places/<id>/bookmark/
// Toggles the bookmark — if already saved, removes it. If not saved, adds it.
// Returns { bookmarked: true } or { bookmarked: false }
export const toggleBookmark = async (placeId) => {
  const response = await api.post(`/places/${placeId}/bookmark/`);
  return response.data;
};

// GET /api/places/<id>/check-bookmark/
// Checks if the current user has bookmarked a specific place
// Returns { bookmarked: true } or { bookmarked: false }
export const checkBookmark = async (placeId) => {
  const response = await api.get(`/places/${placeId}/check-bookmark/`);
  return response.data;
};

// GET /api/bookmarks/my/
// Returns all places the logged-in user has bookmarked
export const getUserBookmarks = async () => {
  const response = await api.get(`/bookmarks/my/`);
  return response.data;
};
