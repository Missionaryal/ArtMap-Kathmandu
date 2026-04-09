// authApi.js
// Functions for authentication-related API calls.
// These are used by AuthContext to log in, register, and get user info.

import api from "./axiosConfig";

// POST /api/token/ — send email + password, get back JWT access and refresh tokens
export const loginUser = async (email, password) => {
  const response = await api.post("/token/", { email, password });
  return response.data;
};

// POST /api/register/ — create a new user account (explorer or creator)
export const registerUser = async ({
  username,
  email,
  password,
  role,
  ...extra
}) => {
  const response = await api.post("/register/", {
    username,
    email,
    password,
    role,
    ...extra,
  });
  return response.data;
};

// GET /api/user/me/ — get the logged-in user's full profile info
// Called right after login to know the user's role, creator status, etc.
export const getUserInfo = async () => {
  const response = await api.get("/user/me/");
  return response.data;
};

// POST /api/forgot-password/ — request a password reset email
export const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password/", { email });
  return response.data;
};

// Aliases for backwards compatibility — some files import these names
export const login = loginUser;
export const register = registerUser;
