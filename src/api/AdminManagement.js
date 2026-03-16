// src/api/Admin.js
import axios from "axios";
export const BASE_URL = import.meta.env.VITE_BACKEND_API;

// Create Admin
export const createAdmin = async (token, userId, email, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/admin/create/${userId}`,
      { email, password },
      {
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
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
export const removeAdmin = async (token, userId, adminId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/admin/remove/${userId}/${adminId}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
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
export const resetAdminPassword = async (
  token,
  userId,
  adminId,
  newPassword
) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/reset-password/${userId}`,
      { adminId, newPassword },
      {
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
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
export const getAllAdmins = async (token, userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/list/${userId}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
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