import React from "react";

export default function ReviewAndPay({ formData, volunteerData, onPay, loading }) {
  const programNames = volunteerData?.map((p) => p.title).join(", ") || "None selected";
  
  return (
    <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
        <div className="p-2.5 bg-linear-to-br from-orange-500 to-red-600 rounded-xl">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Review & Pay</h2>
          <p className="text-gray-400 text-sm">Final step before registration</p>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 text-gray-300 text-sm">
        <div className="flex justify-between"><span>Full Name</span><span className="text-white">{formData.fullName}</span></div>
        <div className="flex justify-between"><span>Email</span><span className="text-white">{formData.email}</span></div>
        <div className="flex justify-between"><span>Programs</span><span className="text-white">{programNames}</span></div>
        <div className="flex justify-between font-semibold border-t border-gray-700 pt-2 mt-2">
          <span>Registration Fee</span><span className="text-white">₹100.00</span>
        </div>
      </div>

      <button
        onClick={onPay}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-white bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Processing Payment...
          </>
        ) : (
          <>Pay ₹100 & Complete Registration</>
        )}
      </button>
      
      <p className="text-xs text-gray-500 text-center">Secure payment powered by Razorpay</p>
    </section>
  );
}