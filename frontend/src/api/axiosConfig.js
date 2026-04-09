// axiosConfig.js
// Sets up the main Axios instance used for all API calls in ArtMap.
// All API files import 'api' from here instead of creating their own axios instances.

import axios from "axios";

// Read the API base URL from the .env file.
// In development this is http://localhost:8000/api
// In production this will be the deployed backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// The backend root URL (without /api) — used for the admin redirect in LoginPage
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Create a pre-configured axios instance with the base URL set
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — runs before every API call
api.interceptors.request.use(
  (config) => {
    // When sending FormData (file uploads), remove the Content-Type header.
    // The browser sets it automatically with the correct multipart boundary.
    // If we set it manually, the boundary is missing and the server rejects the upload.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Attach the JWT access token to every request so the backend knows who is logged in
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — runs after every API response
api.interceptors.response.use(
  // If the response is successful, just pass it through unchanged
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 Unauthorized and haven't already retried this request,
    // try to get a new access token using the refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/token/")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        // Call the token refresh endpoint to get a new access token
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        // Save the new access token and retry the original request
        localStorage.setItem("access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g. refresh token expired), log the user out
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export { BACKEND_URL };
export default api;
