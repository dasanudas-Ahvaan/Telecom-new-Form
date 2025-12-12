import axios from "axios";
export const BASE_URL = import.meta.env.VITE_BACKEND_API;

export const getAllMembers = async (token, userid) => {
  if (!userid) {
    throw new Error("User ID is required to fetch members");
  }
  try {
    const response = await axios.get(`${BASE_URL}/auth/${userid}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Could not fetch members");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred while fetching members";
    console.error("Get Members error:", message);
    throw new Error(message);
  }
};
