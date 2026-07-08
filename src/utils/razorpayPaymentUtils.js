import api from "../api/axiosConfig";
const RP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (amount, prefillData) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) throw new Error("Razorpay SDK failed to load");
  if (!RP_KEY) throw new Error("Razorpay key not present");
  const { name, email, contact } = prefillData;
  const formData = {
    ...prefillData,
    amount: amount,
    receipt: `${Date.now()}_${email}`,
  };
  console.log("fda", formData, RP_KEY);

  const res = await api.post("/pay/", formData, {
    headers: { "Content-Type": "application/json" },
  });
  if (res.status !== 200) {
    throw new Error("payment processing failed, retry later");
  }
  const { order } = res.data.data;
  console.log("res from backend", res.data.data);

  return new Promise((resolve) => {
    const options = {
      key: RP_KEY,
      amount: order.amount,
      currency: order.currency,
      name: "Your Organization",
      description: "Membership Registration",
      order_id: order.id,
      handler: (response) => resolve({ ...response, formData: prefillData }),
      theme: { color: "#ea580c" },
      modal: { ondismiss: () => resolve(null) },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
};
