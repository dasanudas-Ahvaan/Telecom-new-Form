import React from "react";
import ExtraFields from "../ExtraFields";
import Input from "../Input";
import { UserIcon, BookIcon, HomeIcon, FileIcon, CheckCircleIcon } from "../icons/index";

export default function StepTwo({
  loading,
  formData,
  handleChange,
  submitForm,
  message,
  exFields = [],
  errors = {},
}) {
  return (
    <form
      onSubmit={submitForm}
      className="space-y-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl text-left"
    >
      {/* Global Error Message */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-fadeIn">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Please fix the errors below.</span>
        </div>
      )}

      {/* Personal Information */}
      <section>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
          <div className="p-2.5 bg-linear-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-900/20">
            <UserIcon />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Personal Information</h2>
            <p className="text-gray-400 text-sm mt-0.5">Enter your basic details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            error={errors.fullName}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            error={errors.phone}
            className="bg-gray-900/50 border-gray-700 text-orange-500 focus:ring-orange-500"
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Gender{"*"}
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full bg-gray-900/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer ${
                errors.gender ? "border-red-500 bg-red-900/20" : "border-gray-700"
              }`}
            >
              <option value="">Select Gender</option>
              {["male", "female", "other"].map((t) => (
                <option key={t} value={t} className="bg-gray-900 capitalize">
                  {t}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="text-red-400 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
          <Input
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            error={errors.dateOfBirth}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="Aadhar Number"
            name="aadhar"
            value={formData.aadhar}
            onChange={handleChange}
            required
            error={errors.aadhar}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
        </div>
      </section>

      {/* Education & Profession */}
      <section>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
          <div className="p-2.5 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-900/20">
            <BookIcon />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Education & Profession</h2>
            <p className="text-gray-400 text-sm mt-0.5">Your academic and work background</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            required
            error={errors.education}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="Profession"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            required
            error={errors.profession}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
        </div>
      </section>

      {/* Address */}
      <section>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
          <div className="p-2.5 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-900/20">
            <HomeIcon />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Address</h2>
            <p className="text-gray-400 text-sm mt-0.5">Your current residence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Address Line 1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            required
            error={errors.addressLine1}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="Address Line 2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            required
            error={errors.addressLine2}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            error={errors.pincode}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            error={errors.city}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            error={errors.state}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            error={errors.country}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
        </div>
      </section>

      {/* Additional Details */}
      <section>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
          <div className="p-2.5 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-900/20">
            <FileIcon />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Additional Details</h2>
            <p className="text-gray-400 text-sm mt-0.5">Optional information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Previous Associations"
            name="previousAssociations"
            value={formData.previousAssociations}
            onChange={handleChange}
            error={errors.previousAssociations}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
          <Input
            label="Volunteer Programs"
            name="volunteerPrograms"
            value={formData.volunteerPrograms}
            onChange={handleChange}
            error={errors.volunteerPrograms}
            className="bg-gray-900/50 border-gray-700 focus:ring-orange-500"
            
          />
        </div>

        {Array.isArray(exFields) && exFields.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <ExtraFields
              exFields={exFields}
              formData={formData}
              handleChange={handleChange}
              errors={errors}
            />
          </div>
        )}
      </section>

      {/* Submit Button */}
      <footer className="pt-6 border-t border-gray-700">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon />
              <span>Submit Registration</span>
            </>
          )}
        </button>

        {message && (
          <p className="text-center text-green-400 text-sm mt-4 animate-fadeIn">{message}</p>
        )}
      </footer>
    </form>
  );
}