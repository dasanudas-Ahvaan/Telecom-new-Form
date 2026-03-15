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
    <section className="p-6 rounded-xl space-y-6">
      <h2 className="text-xl font-semibold text-red-700 bg-orange-300 rounded py-2">
        Step 1: Verify Email
      </h2>

      <label className="flex flex-col items-start w-full gap-1">
        <span>Email *</span>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-4 focus:ring-red-600 w-full"
          required
        />
      </label>

      <button
        onClick={sendOtp}
        disabled={loading || cooldown}
        className="registerationButtons"
      >
        {"Send OTP"}
      </button>

      {/* OTP INPUT */}
      <label className="flex flex-col items-start gap-1">
        <span>Enter OTP</span>
        <input
          type="text"
          name="otp"
          value={formData.otp}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-4 focus:ring-red-600 w-full"
        />
      </label>

      <button
        onClick={verifyOtp}
        className="registerationButtons"
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
