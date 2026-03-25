import api from "./axiosConfig";
export const BASE_URL = import.meta.env.VITE_BACKEND_API;

export const login = async (formdata) => {
  try {
    const response = await api.post(`/auth/login`, formdata, {
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Could not login");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred during login";
    console.error("Login error:", message);
    throw new Error(message);
  }
};

