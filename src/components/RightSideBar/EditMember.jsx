import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext/AuthContext";
import Loader from "../Loader";

const EditMember = ({ isOpen, onClose, merchant, member }) => {
  const { token, user } = useAuth();

  const initialFormData = {
    email: "",
    password: "",
    fullName: "",
    role: "",
    organization: "",
    provider: "",
    mdr: "",
    fixedFee: "0.5",
    settlementCost: "",
    settlementTime: "",
    refundCharge: "",
    rollingReserve: "",
    minFees: "0.75",
    chargeback: "",
    complianceDocs: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    return;
    const parsedFormData = {
      ...formData,
      minFees: parseFloat(formData.minFees),
      fixedFee: parseFloat(formData.fixedFee),
    };
    try {
      // console.log("DATA>>>", parsedFormData);
      // return;
      setIsLoading(true);
      const response = await updateMerchant(id, parsedFormData, token);
      if (response.success) {
        let payload = updateArray(data.merchant, response.data, merchant._id);

        dispatch(
          updateData({
            merchant: payload,
          })
        );

        setFormData(initialFormData);
        setErr("");
        onClose();
        setIsLoading(false);
      } else {
        console.error("API did not return a valid merchant object");
      }
    } catch (error) {
      console.error(
        "Error creating merchant:",
        error.response?.data || error.message
      );
      setErr("Failed to add merchant. Please try again.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    onClose();
    return;
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
    if (merchant) {
      setFormData(merchant);
    }
  }, [merchant, isOpen]);
  const role = ["merchant", "organization", "organizationUser"];
  return (
    <div
      className={`fixed inset-0 dark:bg-crypto_violet/30 bg-pink-500/30 flex justify-end transition-all duration-300 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleOutSideClick}
    >
      <div
        className={`bg-pink-200 dark:bg-sdl fixed top-0 right-0 font-jose w-[50vw] max-[915px]:w-[80vw] border-r-4 h-screen border-l-[10px] capitalize dark:border-crypto_violet border-pink-400 pl-6 text-left flex flex-col items-start justify-start gap-8 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-center"
        >
          <div className="flex flex-col items-start justify-center gap-2 my-4">
            <label className="font-normal md:text-[28px]/7 text-text_violet">
              Name
            </label>
            <input
              disabled
              autoComplete="off"
              type="text"
              name="fullName"
              value={formData["fullName"]}
              onChange={handleChange}
              className={`font-light dark:bg-violet-900 bg-pink-300 w-full max-w-md focus:outline-none md:text-[20px]/8  rounded-md px-1 pt-[0.8rem] pb-[0.4rem]  placeholder-crypto_violet dark:placeholder-pink-400 ${
                formData?.fullName !== "" ? "cursor-not-allowed" : ""
              }`}
              placeholder="Enter Merchant Name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Compliance Id
              </label>
              <input
                disabled={formData["complianceDocs"] ? true : false}
                autoComplete="off"
                type="text"
                name="complianceDocs"
                value={formData["complianceDocs"]}
                onChange={handleChange}
                className={`inputCls ${
                  formData?.complianceDocs !== "" ? "cursor-not-allowed" : ""
                }`}
                placeholder="Enter compliance id"
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

            {/* <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Password
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="password"
                value={formData["password"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter password"
              />
            </div> */}

            {/* <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Role
              </label>
              <select
                name="role"
                value={formData["role"]}
                onChange={handleChange}
                className="statusCls"
              >
                <option
                  className="font-light text-crypto_violet dark:text-pink-400"
                  value=""
                >
                  Select Status
                </option>
                {role.map((t, idx) => (
                  <option
                    className="font-light text-crypto_violet dark:text-pink-400"
                    key={idx}
                    value={t}
                  >
                    {t}
                  </option>
                ))}
              </select>
            </div> */}
            {/* {formData.role === "organizationUser" && (
              <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
                <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                  Organization
                </label>
                <select
                  name="organization"
                  value={formData["organization"]}
                  onChange={handleChange}
                  className="statusCls"
                >
                  <option
                    className="font-light text-crypto_violet dark:text-pink-400"
                    value=""
                  >
                    Select Organization
                  </option>
                  {Orgs.map((t, idx) => (
                    <option
                      className="font-light text-crypto_violet dark:text-pink-400"
                      key={idx}
                      value={t._id}
                    >
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )} */}
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Provider
              </label>
              <select
                name="provider"
                value={formData["provider"]}
                onChange={handleChange}
                className="statusCls"
              >
                <option
                  className="font-light text-crypto_violet dark:text-pink-400"
                  value=""
                >
                  Select Status
                </option>
                {[].map((t, idx) => (
                  <option
                    className="font-light text-crypto_violet dark:text-pink-400"
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
                MDR
              </label>
              <input
                required
                autoComplete="off"
                type="number"
                name="mdr"
                value={formData["mdr"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter mdr"
              />
            </div>

            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Fixed Fee
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="fixedFee"
                value={formData["fixedFee"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Fixed Fee"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Settlement Cost
              </label>
              <input
                required
                autoComplete="off"
                type="number"
                name="settlementCost"
                value={formData["settlementCost"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Settlement Cost"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Settlement Time
              </label>
              <input
                required
                autoComplete="off"
                type="number"
                name="settlementTime"
                value={formData["settlementTime"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Settlement Time"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Refund Charge
              </label>
              <input
                required
                autoComplete="off"
                type="number"
                name="refundCharge"
                value={formData["refundCharge"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Refund Charge"
              />
            </div>
            <div className="flex items-start justify-between gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Rolling Reserve
              </label>
              <input
                required
                autoComplete="off"
                type="number"
                name="rollingReserve"
                value={formData["rollingReserve"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Rolling Reserve"
              />
            </div>
            <div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Min Fee
              </label>
              <input
                required
                autoComplete="off"
                type="text"
                name="minFees"
                value={formData["minFees"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Min Fee"
              />
            </div>
            <div className="flex items-center justify-start gap-12 resp whitespace-nowrap">
              <label className="w-[16vw] md:w-sm font-normal text-lg py-[0.4rem]">
                Chargeback
              </label>
              <input
                required
                autoComplete="off"
                type="number"
                name="chargeback"
                value={formData["chargeback"]}
                onChange={handleChange}
                className="inputCls"
                placeholder="Enter Chargeback"
              />
            </div>
          </div>

          {err && (
            <label className="text-red-500 text-left mt-4 mb-2">{err}</label>
          )}
          <div className="flex items-center gap-4 resp flex-nowrap mt-2">
            <button
              disabled={isLoading}
              title={isLoading ? <Loader /> : "Add"}
              isBordered={true}
              type="submit"
            >
              Submit
            </button>
            <button
              title="Close"
              isBordered={false}
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMember;
