import ExtraFields from "../ExtraFields";
import Input from "../Input";

export default function StepTwo({
  loading,
  formData,
  handleChange,
  submitForm,
  message,
  exFields = [],
  errors = {}, // Accept errors prop
}) {
  return (
    <form
      onSubmit={submitForm}
      className="space-y-10 bg-orange-50 p-6 rounded-xl shadow-md"
    >
      {/* Global Error Message */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Please fix the errors below.</strong>
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            error={errors.fullName}
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            error={errors.phone}
          />
          <div className="">
            <label className="font-normal text-gray-400 text-lg py-[0.4rem]">
              Gender{"*"}
            </label>
            <select
              name="gender"
              value={formData["gender"]}
              onChange={handleChange}
              className={`font-light w-full max-w-sm md:text-[20px]/8 rounded-md px-1 pt-[0.8rem] pb-[0.8rem] capitalize focus:outline-none focus:ring-2 ${
                errors.gender
                  ? "border-red-500 bg-red-50 text-red-900 focus:ring-red-500"
                  : "dark:bg-violet-900 bg-gray-900 text-gray-400 border-gray-300 focus:ring-red-500"
              }`}
            >
              <option
                className="font-light text-gray-400 bg-black/90 dark:text-gray-400"
                value=""
              >
                Select Gender
              </option>
              {["male", "female", "other"].map((t, idx) => (
                <option
                  className="font-light text-gray-400 bg-black/90 dark:text-gray-400 capitalize"
                  key={idx}
                  value={t}
                >
                  {t}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
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
          />
          <Input
            label="Aadhar Number"
            name="aadhar"
            value={formData.aadhar}
            onChange={handleChange}
            required
            error={errors.aadhar}
          />
        </div>
      </section>

      {/* Education */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Education & Profession
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            required
            error={errors.education}
          />
          <Input
            label="Profession"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            required
            error={errors.profession}
          />
        </div>
      </section>

      {/* Address */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Address</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Address Line 1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            required
            error={errors.addressLine1}
          />
          <Input
            label="Address Line 2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            required
            error={errors.addressLine2}
          />
          <Input
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            error={errors.pincode}
          />
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            error={errors.city}
          />
          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            error={errors.state}
          />
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            error={errors.country}
          />
        </div>
      </section>

      {/* Additional */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Previous Associations"
            name="previousAssociations"
            value={formData.previousAssociations}
            onChange={handleChange}
            error={errors.previousAssociations}
          />
          <Input
            label="Volunteer Programs"
            name="volunteerPrograms"
            value={formData.volunteerPrograms}
            onChange={handleChange}
            error={errors.volunteerPrograms}
          />
          {Array.isArray(exFields) && exFields.length > 0 && (
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Additional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ExtraFields
                  exFields={exFields}
                  formData={formData}
                  handleChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center">
        <button
          disabled={loading}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Registration"}
        </button>
      </footer>

      {message && (
        <p className="text-center text-blue-600 text-sm">{message}</p>
      )}
     
    </form>
  );
}
