import { useEffect, useState } from "react";
import StepEmailVerification from "../components/Register/StepEmailVerification";
import StepTwo from "../components/Register/StepTwo";
import {
  registerMember,
  verifyOtp as v_otp_api,
  sendOtp as s_otp_api,
} from "../api/Register";
import { getCustomFields } from "../api/CustomField";
import { validateStepTwo } from "../utils/validateStepTwo";
import Modal from "../components/Modal";
import { options, serviceChoices } from "../data/flow";
import MultiStepServiceFlow from "../components/MultiStepServiceFlow/Flow2";

const initialData = {
  email: "",
  otp: "",
  fullName: "",
  phone: "",
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
  volunteerPrograms: [],
  aadhar: "",
  extraFields: {},
};

export default function MemberRegistration() {
  const [formData, setFormData] = useState(initialData);
  const [step, setStep] = useState(3);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [cooldown, setCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [exFields, setExFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "default",
    title: "",
    message: "",
  });

  const showModal = (type, title, message) => {
    setModalConfig({ isOpen: true, type, title, message });
  };
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const response = await getCustomFields();
    if (Array.isArray(response?.data)) setExFields(response?.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "volunteerPrograms") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    if (["phone", "aadhar", "pincode"].includes(name)) {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (name === "phone" && numericValue.length > 10) return;
      if (name === "aadhar" && numericValue.length > 12) return;
      if (name === "pincode" && numericValue.length > 6) return;

      setFormData((prev) => ({ ...prev, [name]: numericValue }));

      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    const extraFields = exFields.map((field) => field.label);

    if (extraFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        extraFields: { ...prev.extraFields, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const sendOtp = async () => {
    if (cooldown) return;
    setLoading(true);
    setMessage("");

    try {
      const data = await s_otp_api({ email: formData.email });
      setMessage(data.message);
      setCooldown(true);
      setTimeLeft(300);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setMessage(err.message || "OTP sending failed.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setVerifyLoading(true);
    setMessage("");

    try {
      const data = await v_otp_api({
        email: formData.email,
        otp: formData.otp,
      });

      if (data.success) {
        setCooldown(false);
        setStep(2);
      }

      setMessage(data.message);
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setMessage(err.message || "OTP verification failed.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});
    const validationErrors = validateStepTwo(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const volunteerArray = formData.volunteerPrograms.map((v) => v.value);
    const updatedFormData = {
      ...formData,
      volunteerPrograms: volunteerArray,
    };

    // console.log("DATAAAA", updatedFormData);
    // setLoading(!true);

    // return;
    try {
      const data = await registerMember(updatedFormData);
      setMessage(data.message);
      if (data.success) {
        showModal(
          "success",
          "Registration Successful!",
          "Your member registration has been completed successfully. We will contact you soon.",
        );
        setFormData(initialData);
        setStep(1);
      }
    } catch (err) {
      showModal(
        "error",
        "Registration Failed",
        err.message || "An unexpected error occurred. Please try again.",
      );
      setMessage(err.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 bg-gray-900 min-h-screen">
      <header className="mb-8 text-center pt-5">
        <h1 className="text-3xl font-bold text-red-700">Member Registration</h1>
        <p className="text-gray-600">
          Join our mission by completing registration.
        </p>
      </header>

      {step === 1 ? (
        <StepEmailVerification
          loading={loading}
          verifyLoading={verifyLoading}
          handleChange={handleChange}
          sendOtp={sendOtp}
          verifyOtp={verifyOtp}
          formData={formData}
          message={
            cooldown
              ? `You can resend OTP after ${Math.floor(timeLeft / 60)}:${
                  timeLeft % 60
                } min.`
              : message
          }
          cooldown={cooldown}
        />
      ) : step === 2 ? (
        <StepTwo
          loading={loading}
          handleChange={handleChange}
          formData={formData}
          submitForm={submitForm}
          message={message}
          exFields={exFields}
          errors={errors}
        />
      ) : (
        <MultiStepServiceFlow
          choices={serviceChoices}
          onSubmit={(data) => console.log("Form Submitted:", data)}
        />
      )}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        size="md"
        closeOnOverlay={modalConfig.type === "success"}
      />
    </main>
  );
}
