import axios from "axios";
export const BASE_URL = import.meta.env.VITE_BACKEND_API;

export const getCustomFields = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/custom-field/`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Could not get custom fields");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred while fetching custom fields";
    console.error("Custom Field GET error:", message);
    throw new Error(message);
  }
};

export const createCustomField = async (formdata, userId, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/custom-field/${userId}`,
      formdata,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Could not create custom field");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred while creating custom field";
    console.error("Custom Field CREATE error:", message);
    throw new Error(message);
  }
};

export const deleteCustomField = async (id, userId, token) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/custom-field/${userId}?&fieldId=${id}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Could not delete custom field");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred while deleting custom field";
    console.error("Custom Field DELETE error:", message);
    throw new Error(message);
  }
};
