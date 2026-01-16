import axios from "axios";

const API_URL = "http://localhost:8000/api";
const token = localStorage.getItem("token");

export const createReview = async (placeId, review) => {
  const response = await axios.post(
    `${API_URL}/places/${placeId}/reviews/`,
    review,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getReviews = async (placeId) => {
  const response = await axios.get(`${API_URL}/places/${placeId}/reviews/`);
  return response.data;
};
