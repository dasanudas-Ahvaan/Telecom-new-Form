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
import MultiStepServiceFlow from "../components/MultiStepServiceFlow/Flow2";
import { getVolunteerPrograms } from "../api/VolunteerPrograms";
import ReviewAndPay from "../components/Register/ReviewAndPay";
import {
  initiatePayment,
  initiateSubscription,
} from "../utils/razorpayPaymentUtils";
import SubscribeAndPay from "../components/Register/SubscribeAndPay";
import { getSubscriptionPlans } from "../api/SubscriptionPlans";

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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [volunteerPrograms, setVolunteerPrograms] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [subscriptionPlans, setSubscriptionPlans] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

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
  const [volunteerData, setVolunteerData] = useState(null);

  const showModal = (type, title, message) => {
    setModalConfig({ isOpen: true, type, title, message });
  };
  useEffect(() => {
    fetchFields();
    fetchVolunteerPrograms();
    fetchSubscriptionPlans();
  }, []);

  const fetchFields = async () => {
    const response = await getCustomFields();
    if (Array.isArray(response?.data)) setExFields(response?.data);
  };

  const fetchVolunteerPrograms = async () => {
    const response = await getVolunteerPrograms();
    setVolunteerPrograms(response?.data);
  };
  const fetchSubscriptionPlans = async () => {
    const response = await getSubscriptionPlans();
    setSubscriptionPlans(response?.data.sort((a, b) => a.amount - b.amount));
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

  const handleVolunteerProgramSubmit = async (data) => {
    const volunteerProgramsData = data.selectedIds.map((programId) => {
      const program = volunteerPrograms.find((p) => p._id === programId);

      const answers = Object.fromEntries(
        Object.entries(data.answers)
          .filter(([key]) => key.startsWith(`${programId}_`))
          .map(([key, value]) => {
            // Remove "<programId>_"
            const field = key.slice(programId.length + 1);

            // Remove trailing "_0", "_1", etc.
            const cleanField = field.replace(/_\d+$/, "");

            return [cleanField, value];
          }),
      );

      return {
        programId,
        title: program?.title,
        agreed: data.agreements[programId],
        answers,
      };
    });
    setVolunteerData(volunteerProgramsData);

    // Check if the user opted for financial assistance / monetary choice
    // Adjust the keywords below if your database uses a different naming convention
    const requiresPayment = volunteerProgramsData.some((p) => {
      const title = (p.title || "").toLowerCase();
      return (
        title.includes("financial assistance") ||
        title.includes("monetory") ||
        title.includes("monetary") ||
        title.includes("donation")
      );
    });
    console.log(
      "this is volunteer data before step",
      volunteerData,
      volunteerProgramsData,
    );

    const financialProgram = volunteerProgramsData.find(
      (p) => p.programId === "financial-assistance",
    );

    const frequency =
      financialProgram?.answers["finance-frequency"]?.toLowerCase();

    if (frequency === "once") {
      setStep(4); // Review & Pay
    } else if (frequency === "recurring") {
      setStep(5); // Subscribe & Pay
    } else {
      // Register directly without payment
      setLoading(true);
      try {
        const updatedFormData = {
          ...formData,
          volunteerPrograms: volunteerProgramsData,
        };

        const response = await registerMember(updatedFormData);
        if (response.success) {
          showModal(
            "success",
            "Registration Successful!",
            "Your member registration has been completed successfully. We will contact you soon.",
          );
          setFormData(initialData);
          setStep(1);
        } else {
          showModal("error", "Registration Failed", response.message);
        }
      } catch (err) {
        console.error("Registration error:", err);
        showModal(
          "error",
          "Registration Failed",
          err.message || "Something went wrong.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePayAndRegister = async () => {
    setLoading(true);
    try {
      const paymentAmount = Number(contributionAmount);
      if (paymentAmount < 1) {
        alert("please select a valid amount");
        return;
      }

      const paymentResponse = await initiatePayment(paymentAmount, {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      });

      if (!paymentResponse) {
        showModal(
          "error",
          "Payment Cancelled",
          "You closed the payment window.",
        );
        setLoading(false);
        return;
      }
      const {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpaySubscriptionId,
      } = paymentResponse;
      const donationType = volunteerData
        .find((p) => p.programId === "financial-assistance")
        ?.answers["finance-frequency"].toLowerCase();

      const updatedFormData = {
        ...formData,
        volunteerPrograms: volunteerData,
        paymentType: {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySubscriptionId,
          donationType,
        },
      };
      // Send to backend
      const response = await registerMember(updatedFormData);
      if (response.success) {
        showModal(
          "success",
          "Registration Successful!",
          "Your member registration has been completed successfully. We will contact you soon.",
        );

        setFormData(initialData);

        setStep(1);
      } else {
        showModal("error", "Registration Failed", response.message);
      }
    } catch (err) {
      console.error("haha", err);
      showModal(
        "error",
        "Payment Failed",
        err.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeAndRegister = async () => {
    setLoading(true);
    try {
      const { id: planId, amount } = selectedPlan;
      if (!selectedPlan.id) {
        alert("please select a valid monthly donation plan");
        return;
      }
      const paymentResponse = await initiateSubscription(planId, {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      });

      if (!paymentResponse) {
        showModal(
          "error",
          "Payment Cancelled",
          "You closed the payment window.",
        );
        setLoading(false);
        return;
      }
      console.log("payment response form subscription", paymentResponse);
      const {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpaySubscriptionId,
      } = paymentResponse;
      const donationType = volunteerData
        .find((p) => p.programId === "financial-assistance")
        ?.answers["finance-frequency"].toLowerCase();

      const updatedFormData = {
        ...formData,
        volunteerPrograms: volunteerData,
        paymentType: {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySubscriptionId,
          donationType,
        },
      };
      // Send to backend
      const response = await registerMember(updatedFormData);
      if (response.success) {
        showModal(
          "success",
          "Registration Successful!",
          "Your member registration has been completed successfully. We will contact you soon.",
        );

        setFormData(initialData);

        setStep(1);
      } else {
        showModal("error", "Registration Failed", response.message);
      }
    } catch (err) {
      console.error("haha", err);
      showModal(
        "error",
        "Payment Failed",
        err.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const continueToVolunteerStep = (e) => {
    e.preventDefault();

    const validationErrors = validateStepTwo(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    setErrors({});
    setStep(3);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 bg-gray-900 min-h-screen">
      <header className="mb-8 text-center pt-5">
        <h1 className="text-3xl font-bold text-red-700">Member Registration</h1>
        <p className="text-gray-600">
          Join our mission by completing registration.
        </p>
      </header>

      {step === 1 && (
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
      )}
      {step === 2 && (
        <StepTwo
          loading={loading}
          handleChange={handleChange}
          onContinue={continueToVolunteerStep}
          formData={formData}
          // submitForm={submitForm}
          message={message}
          exFields={exFields}
          errors={errors}
        />
      )}
      {step === 3 && (
        <MultiStepServiceFlow
          choices={volunteerPrograms}
          onSubmit={handleVolunteerProgramSubmit}
        />
      )}
      {step === 4 && (
        <ReviewAndPay
          formData={formData}
          volunteerData={volunteerData}
          onPay={handlePayAndRegister}
          loading={loading}
          contributionAmount={contributionAmount}
          setContributionAmount={setContributionAmount}
        />
      )}
      {step === 5 && (
        <SubscribeAndPay
          formData={formData}
          volunteerData={volunteerData}
          plans={subscriptionPlans}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          onSubscribe={handleSubscribeAndRegister}
          loading={loading}
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
