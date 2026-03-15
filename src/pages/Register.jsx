import { useEffect, useState } from "react";
import StepEmailVerification from "../components/Register/StepEmailVerification";
import StepTwo from "../components/Register/StepTwo";
import {
  registerMember,
  verifyOtp as v_otp_api,
  sendOtp as s_otp_api,
} from "../api/Register";
import { getCustomFields } from "../api/CustomField";
import { useToast } from "../components/ToastContext";

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

  const showToast = useToast();

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

  const isValidEmail = (email) => {
    // Pattern: [characters] @ [characters] . [2+ characters]
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) return false;

    return emailRegex.test(email);
  }

  const sendOtp = async () => {
    if (cooldown) return;
    if (!isValidEmail(formData.email)) {
      showToast("Not a Vaild Email.", "error")
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const data = await s_otp_api({ email: formData.email });
      setMessage(data.message);
      showToast(data.message);
      console.log(data)
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
        showToast(err.message, "error");
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
      showToast(data.message, "success")
    } catch (err) {
        showToast(err.message || "OTP verification failed.", "error")
      setMessage(err.message || "OTP verification failed.");
    } finally {
      setVerifyLoading(false);
    }
  };


  const validateForm = (data) => {
    const isEmpty = (val) => !val || val.length === 0;

    // Helper to check if string exceeds length
    const exceeds = (val, limit) => (val ? val.length > limit : false);

    // 1. Full Name
    if (isEmpty(data.fullName)) {
      showToast("Full name is required");
      return false;
    }
    if (exceeds(data.fullName, 60)) {
      showToast("Full name cannot exceed 60 characters");
      return false;
    }

    // 2. Phone
    if (!/^\d{10}$/.test(data.phone)) {
      showToast("Enter a valid 10-digit phone number");
      return false;
    }

    // 3. Gender & DOB
    if (isEmpty(data.gender)) {
      showToast("Please select gender");
      return false;
    }
    if (isEmpty(data.dateOfBirth)) {
      showToast("Date of birth is required");
      return false;
    }

    // 4. Education & Profession
    if (isEmpty(data.education)) {
      showToast("Education is required");
      return false;
    }
    if (exceeds(data.education, 100)) {
      showToast("Education details are too long (max 100)");
      return false;
    }
    if (isEmpty(data.profession)) {
      showToast("Profession is required");
      return false;
    }
    if (exceeds(data.profession, 100)) {
      showToast("Profession details are too long (max 100)");
      return false;
    }

    // 5. Address Line 1 & 2
    if (isEmpty(data.addressLine1)) {
      showToast("Address Line 1 is required");
      return false;
    }
    if (exceeds(data.addressLine1, 150)) {
      showToast("Address Line 1 is too long (max 150)");
      return false;
    }
    if (exceeds(data.addressLine2, 150)) {
      showToast("Address Line 2 is too long (max 150)");
      return false;
    }

    // 6. City, State, Country
    if (isEmpty(data.city) || exceeds(data.city, 50)) {
      showToast("Valid City name is required (max 50)");
      return false;
    }
    if (isEmpty(data.state) || exceeds(data.state, 50)) {
      showToast("Valid State name is required (max 50)");
      return false;
    }
    if (isEmpty(data.country) || exceeds(data.country, 50)) {
      showToast("Valid Country name is required (max 50)");
      return false;
    }

    // 7. Pincode (6 digits)
    if (!/^\d{6}$/.test(data.pincode)) {
      showToast("Pincode must be exactly 6 digits");
      return false;
    }

    // 8. Aadhar (12 digits)
    if (!/^\d{12}$/.test(data.aadhar)) {
      showToast("Aadhar must be exactly 12 digits");
      return false;
    }

    return true; 
  };
  const submitForm = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return
    setLoading(true);
    setMessage("");
    try {
      const data = await registerMember(formData);
      setMessage(data.message);
      showToast(data.message, "success");
      if (data.success) setFormData(initialData);
    } catch (err) {
      setMessage(err.message || "Submission failed.");
      showToast(err.message, "error");
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