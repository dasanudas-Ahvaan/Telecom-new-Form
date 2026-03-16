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
  volunteerPrograms: "",
  aadhar: "",
  extraFields: {},
};

export default function MemberRegistration() {
  const [formData, setFormData] = useState(initialData);
  const [step, setStep] = useState(1);
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

    // 1. INPUT SANITIZATION (OnChange)
    // Prevent letters in numeric fields immediately
    if (["phone", "aadhar", "pincode"].includes(name)) {
      const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-digits
      // Optional: Limit length to match schema
      if (name === "phone" && numericValue.length > 10) return;
      if (name === "aadhar" && numericValue.length > 12) return;
      if (name === "pincode" && numericValue.length > 6) return;

      // Update state with sanitized value
      setFormData((prev) => ({ ...prev, [name]: numericValue }));

      // Clear error for this field if it exists
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // 2. STANDARD HANDLING FOR TEXT FIELDS
    const extraFields = exFields.map((field) => field.label);

    if (extraFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        extraFields: { ...prev.extraFields, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing again
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
    setErrors({}); // Reset errors

    // 1. Run Validation
    const validationErrors = validateStepTwo(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      // Scroll to top to see errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Submit if valid
    try {
      const data = await registerMember(formData);
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
    <main className="max-w-3xl mx-auto px-4 bg-orange-50 border-x min-h-screen">
      <header className="mb-8 text-center pt-5">
        <h1 className="text-3xl font-bold text-red-700">Member Registration</h1>
        <p className="text-gray-600">
          Join our mission by completing registration.
        </p>
      </header>

      {step === 21 ? (
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
      ) : (
        <StepTwo
          loading={loading}
          handleChange={handleChange}
          formData={formData}
          submitForm={submitForm}
          message={message}
          exFields={exFields}
          errors={errors}
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
