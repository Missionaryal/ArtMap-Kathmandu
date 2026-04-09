// postsApi.js
// Functions for user posts — photos that users tag to a specific place.
// Think of it like Instagram posts tied to an ArtMap location.

import api from "./axiosConfig";

// GET /api/places/<id>/posts/ — get all public posts tagged at a specific place
export const getPlacePosts = async (placeId) => {
  const response = await api.get(`/places/${placeId}/posts/`);
  return response.data;
};

// GET /api/places/<id>/photos/ — get gallery photos uploaded by the creator for a place
// These are different from user posts — they are the official place gallery
export const getPlacePhotos = async (placeId) => {
  const response = await api.get(`/places/${placeId}/photos/`);
  return response.data;
};

// POST /api/posts/ — create a new post with a photo tagged to a place
// Sends as FormData because it includes an image file
export const createPost = async (formData) => {
  const response = await api.post("/posts/", formData);
  return response.data;
};

// GET /api/posts/?my_posts=true — get only the logged-in user's own posts
export const getUserPosts = async () => {
  const response = await api.get("/posts/?my_posts=true");
  return response.data;
};

// DELETE /api/posts/<id>/ — delete a post (only the author can do this)
export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}/`);
  return response.data;
};
