import { ShieldIcon, EmailIcon, CheckIcon, LoaderIcon } from "../icons/index.jsx";

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
    <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
        <div className="p-2.5 bg-linear-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-900/20">
          <ShieldIcon />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-semibold text-white">Verify Email</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Step 1 of registration process
          </p>
        </div>
      </div>

      {/* Email Input */}
      <div className="text-left text-orange-500">
        <label className="block text-sm font-medium mb-2">
          Email Address <span className="text-orange-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <EmailIcon />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      {/* Send OTP Button */}
      <button
        onClick={sendOtp}
        disabled={loading || cooldown}
        className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <LoaderIcon />
            <span>Sending...</span>
          </>
        ) : cooldown ? (
          <>
            <span>{message}</span>
          </>
        ) : (
          <>
            <EmailIcon />
            <span>Send OTP</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-800/50 text-gray-500">or</span>
        </div>
      </div>

      {/* OTP Input */}
      <div className="text-orange-500 text-left">
        <label className="block text-sm font-medium mb-2">
          Enter OTP <span className="text-orange-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <ShieldIcon />
          </div>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all tracking-widest text-center"
          />
        </div>
      </div>

      {/* Verify OTP Button */}
      <button
        onClick={verifyOtp}
        disabled={verifyLoading || !formData.otp}
        className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:shadow-green-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {verifyLoading ? (
          <>
            <LoaderIcon />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <CheckIcon />
            <span>Verify OTP</span>
          </>
        )}
      </button>
      {/* Message */}
      {/* {message && (
        <div className="p-4 rounded-xl border bg-blue-900/30 border-blue-800 text-blue-400 text-sm font-medium text-center animate-fadeIn">
          <p>{message}</p>
        </div>
      )} */}
    </section>
  );
}

export default StepEmailVerification;
