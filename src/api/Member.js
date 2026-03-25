import api from "./axiosConfig";

export const editMember = async (userid, formdata) => {
  try {
    const response = await api.put(
      `/auth/${userid}?&id=${formdata._id}`,
      formdata,
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //     authorization: `Bearer ${token}`,
      //   },
      // },
    );
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error("Could not edit member");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred during member edit";
    console.error("Edit member error:", message);
    throw new Error(message);
  }
};

export const deleteMember = async (userid, memberid) => {
  try {
    const response = await api.delete(`/auth/${userid}?&id=${memberid}`, 
    //   {
    //   headers: {
    //     "Content-Type": "application/json",
    //     authorization: `Bearer ${token}`,
    //   },
    // }
  );
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error("Could not delete member");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred during member deletion";
    console.error("Delete member error:", message);
    throw new Error(message);
  }
};
