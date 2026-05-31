import api from "./axiosConfig";

export const getVolunteerPrograms = async () => {
  try {
    const response = await api.get(`/volunteer/`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Could not get volunteer programs");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred while fetching volunteer programs";
    console.error("volunteer programs GET error:", message);
    throw new Error(message);
  }
};