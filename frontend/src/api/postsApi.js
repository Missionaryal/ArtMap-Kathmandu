import api from "./axiosConfig";

// Get posts for a place
export const getPlacePosts = async (placeId) => {
  const response = await api.get(`/places/${placeId}/posts/`);
  return response.data;
};

// Get photos for a place
export const getPlacePhotos = async (placeId) => {
  const response = await api.get(`/places/${placeId}/photos/`);
  return response.data;
};

// Create a new post (multipart/form-data)
export const createPost = async (formData) => {
  const response = await api.post("/posts/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Get current user's posts
export const getUserPosts = async () => {
  const response = await api.get("/posts/?my_posts=true");
  return response.data;
};

// Delete a post
export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}/`);
  return response.data;
};
