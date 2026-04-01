import api from "./axiosConfig";

export const toggleBookmark = async (placeId) => {
  const response = await api.post(`/places/${placeId}/bookmark/`);
  return response.data;
};

export const checkBookmark = async (placeId) => {
  const response = await api.get(`/places/${placeId}/check-bookmark/`);
  return response.data;
};

export const getUserBookmarks = async () => {
  const response = await api.get(`/bookmarks/my/`);
  return response.data;
};
