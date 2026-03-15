import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext/AuthContext";
import Loader from "../Loader";
import { getCustomFields } from "../../api/CustomField";
import ExtraFields from "../ExtraFields";
import { deleteMember, editMember } from "../../api/Member";

const EditMember = ({ isOpen, onClose, member, onUpdate, onDelete }) => {
  const { token, user } = useAuth();

  const initialFormData = {
    email: "",
    fullName: "",
    phone: "",
    extraFields: {},
  };

  const [formData, setFormData] = useState(initialFormData);
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exFields, setExFields] = useState([]);
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const response = await getCustomFields();
    if (Array.isArray(response?.data)) setExFields(response?.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "isVerified") {
      value = value === "true";
    }
    const extraFields = exFields.map((field) => field.label);
    if (extraFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        extraFields: {
          ...prev.extraFields,
          [name]: value,
        },
      }));
      return;
    } else
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await editMember(token, user._id, formData);
      if (response.success) {
        onUpdate(response.data);
        setFormData(initialFormData);
        setErr("");
        onClose();
        setIsLoading(false);
      } else {
        console.error("API did not return a valid member object");
      }
    } catch (error) {
      console.error("Error creating member:", error.message);
      setErr(error.message || "Failed to add member. Please try again.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await deleteMember(token, user._id, formData._id);
      if (response.success) {
        onDelete(formData._id);
        setFormData(initialFormData);
        setErr("");
        onClose();
        setIsLoading(false);
      } else {
        console.error("API did not return a valid member object");
      }
    } catch (error) {
      console.error("Error deleting member:", error.message);
      setErr(error.message || "Failed to delete member. Please try again.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    onClose();
    setFormData(initialFormData);
    setIsLoading(false);
    setErr("");
  };
  const handleOutSideClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        extraFields: member.extraFields || {},
      });
    }
  }, [member, isOpen]);
  return (
    <div
      className={`fixed inset-0 z-1000 dark:bg-yellow/30 bg-gray-500/30 flex justify-end transition-all duration-300 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleOutSideClick}
    >
      <div
        className={`bg-gray-200 dark:bg-sdl fixed top-0 right-0 font-jose w-[50vw] max-[915px]:w-[80vw] border-r-4 h-screen border-l-10 capitalize dark:border-yellow border-gray-400 pl-6 text-left flex flex-col items-start justify-start gap-8 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-center"
        >
          <div className="flex flex-col items-start justify-center gap-2 my-4">
            <label className="font-normal md:text-[28px]/7 text-black">
              Full Name
            </label>
            <input
              disabled
              autoComplete="off"
              type="text"
              name="fullName"
              value={formData["fullName"]}
              onChange={handleChange}
              className={`font-light dark:bg-violet-900 bg-gray-300 w-full max-w-md focus:outline-none md:text-[20px]/8  rounded-md px-1 pt-[0.8rem] pb-[0.4rem]  placeholder-gray-400 dark:placeholder-gray-400 ${
                formData?.fullName !== "" ? "cursor-not-allowed" : ""
              }`}
              placeholder="Enter Member Name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Phone
              </label>
              <input
                disabled={formData["phone"] ? true : false}
                autoComplete="off"
                type="text"
                name="phone"
                value={formData["phone"]}
                onChange={handleChange}
                className={`inputCls ${
                  formData?.phone !== "" ? "cursor-not-allowed" : ""
                }`}
                placeholder="Enter phone"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Email
              </label>
              <input
                disabled
                autoComplete="off"
                type="email"
                name="email"
                value={formData["email"]}
                onChange={handleChange}
                className={`inputCls ${
                  formData?.email !== "" ? "cursor-not-allowed" : ""
                }`}
                placeholder="Enter email"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Verification Status
              </label>
              <select
                name="isVerified"
                value={formData["isVerified"]}
                onChange={handleChange}
                className="statusCls"
              >
                <option
                  className="font-light text-black dark:text-gray-400"
                  value=""
                >
                  Select Verification Status
                </option>
                {[true, false].map((t, idx) => (
                  <option
                    className="font-light text-black dark:text-gray-400"
                    key={idx}
                    value={t}
                  >
                    {t ? "Verified" : "Not Verified"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Activity Status
              </label>
              <select
                name="status"
                value={formData["status"]}
                onChange={handleChange}
                className="statusCls"
              >
                <option
                  className="font-light text-black dark:text-gray-400"
                  value=""
                >
                  Select Acitivity Status
                </option>
                {["active", "inactive"].map((t, idx) => (
                  <option
                    className="font-light text-black dark:text-gray-400 capitalize"
                    key={idx}
                    value={t}
                  >
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Gender
              </label>
              <select
                name="gender"
                value={formData["gender"]}
                onChange={handleChange}
                className="statusCls"
              >
                <option
                  className="font-light text-black dark:text-gray-400"
                  value=""
                >
                  Select Gender
                </option>
                {["male", "female", "other"].map((t, idx) => (
                  <option
                    className="font-light text-black dark:text-gray-400 capitalize"
                    key={idx}
                    value={t}
                  >
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                D.O.B
              </label>
              <input
                required
                autoComplete="off"
                name="dateOfBirth"
                value={
                  formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter dateOfBirth"
                type="date"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Education
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="education"
                value={formData["education"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter education"
              />
            </div>

            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Profession
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="profession"
                value={formData["profession"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Profession"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Address Line 1
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="addressLine1"
                value={formData["addressLine1"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Address Line 1"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Address Line 2
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="addressLine2"
                value={formData["addressLine2"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Address Line 2"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Pincode
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="pincode"
                value={formData["pincode"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Pincode"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                City
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="city"
                value={formData["city"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter City"
              />
            </div>
            <div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                State
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="state"
                value={formData["state"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter State"
              />
            </div>
            <div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Country
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="country"
                value={formData["country"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Country"
              />
            </div>
            <div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Previous Associations
              </label>
              <input
                autoComplete="off"
                type="text"
                name="previousAssociations"
                value={formData["previousAssociations"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Previous Associations"
              />
            </div>
            <div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Volunteer Programs
              </label>
              <input
                autoComplete="off"
                type="text"
                name="volunteerPrograms"
                value={formData["volunteerPrograms"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Volunteer Programs"
              />
            </div>
            <div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Aadhar Number
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="aadhar"
                value={formData["aadhar"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Aadhar Number"
              />
            </div>
            {Array.isArray(exFields) && exFields.length > 0 && (
              <div className="flex flex-col items-start">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Additional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ExtraFields
                    exFields={exFields}
                    formData={formData}
                    handleChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          {err && (
            <label className="text-red-500 text-left mt-4 mb-2">{err}</label>
          )}
          <div className="flex items-center gap-4 resp flex-nowrap my-6">
            <button
              className="rightSideBar_Submit_Button"
              disabled={isLoading}
              title={isLoading ? <Loader /> : "Add"}
              type="submit"
            >
              Submit
            </button>
            <button
              className="rightSideBar_Edit_Delete_Button"
              title="Close"
              onClick={() => {
                onClose();
                if (isLoading) {
                  setIsLoading(false);
                }
                setFormData(initialFormData);
              }}
              type="button"
            >
              Close
            </button>
            <button
              className="deleteMemberButton"
              title="Delete Member"
              onClick={() => handleDelete()}
              type="button"
            >
              Delete Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMember;
