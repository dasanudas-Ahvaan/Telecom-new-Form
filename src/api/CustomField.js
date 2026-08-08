import api from "./axiosConfig";

export const getCustomFields = async () => {
  try {
    const response = await api.get(`/custom-field/`);
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

export const createCustomField = async (formdata, userId) => {
  try {
    const response = await api.post(
      `/custom-field/${userId}`,
      formdata,
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

export const deleteCustomField = async (id, userId) => {
  try {
    const response = await api.delete(
      `/custom-field/${userId}?&fieldId=${id}`,
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
