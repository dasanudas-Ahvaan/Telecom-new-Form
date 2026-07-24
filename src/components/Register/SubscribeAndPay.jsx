import React from "react";

export default function SubscribeAndPay({
  formData,
  volunteerData,
  plans = [],
  selectedPlan,
  setSelectedPlan,
  onSubscribe,
  loading,
}) {
  const programNames =
    volunteerData?.map((p) => p.title).join(", ") || "None selected";
    
  return (
    <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
        <div className="p-2.5 bg-linear-to-br from-orange-500 to-red-600 rounded-xl">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-3.314 0-6 2.686-6 6v2h12v-2c0-3.314-2.686-6-6-6zm0-6a3 3 0 100 6 3 3 0 000-6z"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Subscribe & Support
          </h2>
          <p className="text-gray-400 text-sm">
            Create your recurring monthly contribution
          </p>
        </div>
      </div>

      {/* Review */}
      <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Full Name</span>
          <span className="text-white">{formData.fullName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Email</span>
          <span className="text-white">{formData.email}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Programs</span>
          <span className="text-white text-right">{programNames}</span>
        </div>
      </div>

      {/* Subscription Plans */}
      <div>
        <h3 className="text-white font-medium mb-3">
          Choose Monthly Contribution
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan)}
              className={`rounded-xl border p-4 transition ${
                selectedPlan?.id === plan.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <div className="text-xl font-bold text-white">
                ₹{plan.amount}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                per month
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      {selectedPlan && (
        <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 text-sm text-orange-100">
          You will be charged <b>₹{selectedPlan.amount}</b> every month until
          you cancel the subscription.
        </div>
      )}

      {/* CTA */}
      <button
        disabled={loading || !selectedPlan}
        onClick={onSubscribe}
        className="w-full py-3.5 rounded-xl font-semibold text-white bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
              />
            </svg>
            Creating Subscription...
          </>
        ) : (
          <>
            Subscribe ₹{selectedPlan?.amount ?? 0}/month & Complete Registration
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Your monthly contribution will be securely processed via Razorpay.
        You can cancel the subscription anytime.
      </p>
    </section>
  );
}