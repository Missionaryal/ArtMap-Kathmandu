import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const getPlaces = async () => {
  const response = await axios.get(`${API_URL}/places/`);
  return response.data;
};

export const getPlaceById = async (id) => {
  const response = await axios.get(`${API_URL}/places/${id}/`);
  return response.data;
};
