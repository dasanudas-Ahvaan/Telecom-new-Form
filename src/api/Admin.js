import api from "./axiosConfig";

export const getAllMembers = async (userid, status = "unverified") => {
  if (!userid) {
    throw new Error("User ID is required to fetch members");
  }
  try {
    const response = await api.get(`/auth/${userid}`, {
      // headers: { authorization: `Bearer ${token}` },
      params: { status },
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
