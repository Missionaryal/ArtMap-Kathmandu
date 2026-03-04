import api from "./axiosConfig";

// Register a new user
export const registerUser = async (name, email, password) => {
  const response = await api.post("/register/", {
    username: email, // ← Use email as username
    email: email,
    password: password,
  });
  return response.data;
};

// Login user
export const loginUser = async (email, password) => {
  const response = await api.post("/token/", {
    username: email, // Django SimpleJWT expects 'username'
    password: password,
  });
  return response.data;
};
