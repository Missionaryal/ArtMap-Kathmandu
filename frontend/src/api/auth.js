import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login/`, credentials);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

export const register = async (user) => {
  const response = await axios.post(`${API_URL}/auth/register/`, user);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

export const getMe = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
