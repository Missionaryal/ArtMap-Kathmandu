import axios from "axios";

const API_URL = "http://localhost:8000/api";
const token = localStorage.getItem("token");

export const createPost = async (post) => {
  const response = await axios.post(`${API_URL}/posts/`, post, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getPosts = async () => {
  const response = await axios.get(`${API_URL}/posts/`);
  return response.data;
};
