import api from "./axiosConfig";

// Create Admin
export const createAdmin = async (email, password, name) => {
  try {
    const response = await api.post(
      `/admin/create/`,
      { email, password, name },
      // {
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // },
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create admin";
    console.error("Create Admin error:", message);
    throw new Error(message);
  }
};

// Remove Admin
export const removeAdmin = async (adminId) => {
  try {
    const response = await api.delete(
      `/admin/remove/${adminId}`,
      //    {
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to remove admin";
    console.error("Remove Admin error:", message);
    throw new Error(message);
  }
};

// Reset Admin Password
export const resetAdminPassword = async (adminId, newPassword) => {
  try {
    const response = await api.put(
      `/admin/reset-password/`,
      { adminId, newPassword },
      // {
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // },
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to reset password";
    console.error("Reset Password error:", message);
    throw new Error(message);
  }
};

// Get All Admins
export const getAllAdmins = async () => {
  try {
    const response = await api.get(
      `/admin/list/`,
      //    {
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch admins";
    console.error("Get Admins error:", message);
    throw new Error(message);
  }
};
