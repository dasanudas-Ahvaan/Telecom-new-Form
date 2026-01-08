function StepEmailVerification({
  loading,
  verifyLoading,
  sendOtp,
  verifyOtp,
  handleChange,
  formData,
  message,
  cooldown,
}) {
  return (
    <section className="bg-white-400 p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-black-700">
        Step 1: Verify Email
      </h2>

      <label className="flex flex-col gap-1">
        <span>Email *</span>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-white-600"
          required
        />
      </label>

      <button
        onClick={sendOtp}
        disabled={loading || cooldown}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {"Send OTP"}
      </button>

      {/* OTP INPUT */}
      <label className="flex flex-col gap-1">
        <span>Enter OTP</span>
        <input
          type="text"
          name="otp"
          value={formData.otp}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-red-600"
        />
      </label>

      <button
        onClick={verifyOtp}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        disabled={verifyLoading}
      >
        {verifyLoading ? "Verifying..." : "Verify OTP"}
      </button>

      {message && (
        <p className="text-center text-sm text-blue-600">{message}</p>
      )}
    </section>
  );
}
export default StepEmailVerification;
