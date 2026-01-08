import { useEffect, useState } from "react";
import StepEmailVerification from "../components/Register/StepEmailVerification";
import StepTwo from "../components/Register/StepTwo";
import {
  registerMember,
  verifyOtp as v_otp_api,
  sendOtp as s_otp_api,
} from "../api/Register";
import { getCustomFields } from "../api/CustomField";

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

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const response = await getCustomFields();
    if (Array.isArray(response?.data)) setExFields(response?.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isExtra = exFields.some((field) => field.label === name);

    if (isExtra) {
      setFormData((prev) => ({
        ...prev,
        extraFields: { ...prev.extraFields, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      const data = await v_otp_api({ email: formData.email, otp: formData.otp });
      if (data.success) setStep(2);
      setMessage(data.message);
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
    try {
      const data = await registerMember(formData);
      setMessage(data.message);
      if (data.success) setFormData(initialData);
    } catch (err) {
      setMessage(err.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Center the form on the background and ensure transparency */
    <main className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center bg-transparent">
      
      {/* Header with glass effect text background */}
      <header className="mb-8 text-center bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/70 shadow-lg max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white-700 drop-shadow-md">
          Member Registration
        </h1>
        <p className="text-white-800 font-medium mt-2">
          Join our mission by completing registration.
        </p>
      </header>

      {/* Main Form Container - Semi-transparent white card */}
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/70 overflow-hidden">
        <div className="p-8 md:p-12">
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
          ) : (
            <StepTwo
              loading={loading}
              handleChange={handleChange}
              formData={formData}
              submitForm={submitForm}
              message={message}
              exFields={exFields}
            />
          )}
        </div>
      </div>
    </main>
  );
}