import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext/AuthContext";
import Loader from "../Loader";
import { getCustomFields } from "../../api/CustomField";
import ExtraFields from "../ExtraFields";
import { deleteMember, editMember } from "../../api/Member";

const EditMember = ({ isOpen, onClose, member, onUpdate, onDelete }) => {
  const { user } = useAuth();

  const initialFormData = {
    _id: "",
    email: "",
    fullName: "",
    phone: "",
    isVerified: false,
    status: "active",
    gender: "",
    dateOfBirth: "",
    education: "",
    profession: "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    previousAssociations: "",
    volunteerPrograms: "",
    aadhar: "",
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
    let transformedValue = value;
    if (name === "isVerified") {
      transformedValue = value === "true"; // Compare with string since select returns string
    }
    if (["phone", "aadhar", "pincode"].includes(name)) {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (name === "phone" && numericValue.length > 10) return;
      if (name === "aadhar" && numericValue.length > 12) return;
      if (name === "pincode" && numericValue.length > 6) return;

      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    const extraFields = exFields.map((field) => field.label);
    if (extraFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        extraFields: {
          ...prev.extraFields,
          [name]: transformedValue,
        },
      }));
      return;
    } else
      setFormData((prev) => ({
        ...prev,
        [name]: transformedValue,
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const keepAsItIs = [
        "previousAssociations",
        "volunteerPrograms",
        "email",
        "fullName",
        // "aadhar",
      ];
      const filtered = Object.keys(formData)
        .filter((o) => !keepAsItIs.includes(o))
        .reduce((obj, key) => {
          obj[key] = formData[key];
          return obj;
        }, {});
      // console.log("formdata", filtered);
      // return;
      const response = await editMember(filtered);
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
      console.error("Error updating member:", error.message);
      setErr("Failed to update member. Please try again.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await deleteMember(formData._id);
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
        className={`bg-gray-900 fixed top-0 right-0 font-jose w-[50vw] max-[915px]:w-[80vw] border-r-4 h-screen border-l-10 capitalize dark:border-yellow border-orange-400 pl-6 text-left flex flex-col items-start justify-start gap-8 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-center"
        >
          <div className="flex flex-col items-start justify-center gap-2 my-4">
            <label className="font-normal md:text-[28px]/7 text-white">
              Full Name
            </label>
            <input
              disabled
              autoComplete="off"
              type="text"
              name="fullName"
              value={formData["fullName"]}
              onChange={handleChange}
              className={`font-light w-full bg-gray-800 border border-red-700 text-gray-200 max-w-md focus:outline-none md:text-[20px]/8  rounded-md px-1 pt-[0.8rem] pb-[0.4rem] ${
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
                className={`w-full bg-gray-800 border border-red-700 rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  formData?.phone ? "opacity-60 cursor-not-allowed" : ""
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
                className={`w-full bg-gray-800 border border-red-700 rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  formData?.email ? "opacity-60 cursor-not-allowed" : ""
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
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter dateOfBirth"
                type="text"
                pattern="^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$"
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
            {/*<div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Previous Associations
              </label>
              <input
                disabled
                autoComplete="off"
                type="text"
                name="previousAssociations"
                value={formData["previousAssociations"]}
                onChange={() => {}}
                className={`w-full bg-gray-800 border border-red-700 rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  formData?.previousAssociations
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
                placeholder="Enter Previous Associations"
              />
            </div>
             <div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Volunteer Programs
              </label>
              <input
                disabled
                autoComplete="off"
                type="text"
                name="volunteerPrograms"
                value={formData["volunteerPrograms"]}
                onChange={() => {}}
                className={`w-full bg-gray-800 border border-red-700 rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  formData?.volunteerPrograms
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
                placeholder="Enter Volunteer Programs"
              />
            </div> */}
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
          <div className="flex gap-4 flex-col items-start sm:items-center sm:flex-row flex-nowrap my-6">
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
            {/* temporary disabled */}
            {/* <button
              className="deleteMemberButton"
              title="Delete Member"
              onClick={() => handleDelete()}
              type="button"
            >
              Delete Member
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMember;
