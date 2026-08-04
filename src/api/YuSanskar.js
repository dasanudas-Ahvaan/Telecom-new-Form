import api from "./axiosConfig";

export const submitYuSanskar = async (formdata) => {
  try {
    const response = await api.post(`/yu-sanskar`, formdata, {
      headers: { "Content-Type": "application/json" },
    });
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error("Could not register member");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred during member registration";
    console.error("member registration error:", message);
    throw new Error(message);
  }
};