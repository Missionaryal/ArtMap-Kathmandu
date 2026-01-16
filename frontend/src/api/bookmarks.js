import axios from "axios";

const API_URL = "http://localhost:8000/api";
const token = localStorage.getItem("token");

export const addBookmark = async (placeId) => {
  const response = await axios.post(
    `${API_URL}/bookmarks/`,
    { place: placeId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getBookmarks = async () => {
  const response = await axios.get(`${API_URL}/bookmarks/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
