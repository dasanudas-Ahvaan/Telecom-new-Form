import api from "./axiosConfig";

export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get(`/subscribe/plans/`);
    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Could not get subscription plans");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred while fetching subscription plans";
    console.error("subscription plans GET error:", message);
    throw new Error(message);
  }
};
