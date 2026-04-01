import api from "./axiosConfig";

export const loginUser = async (email, password) => {
  const response = await api.post("/token/", { email, password });
  return response.data;
};

export const registerUser = async ({ username, email, password, role, ...extra }) => {
  const response = await api.post("/register/", { username, email, password, role, ...extra });
  return response.data;
};

export const getUserInfo = async () => {
  const response = await api.get("/user/me/");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password/", { email });
  return response.data;
};

export const login = loginUser;
export const register = registerUser;
