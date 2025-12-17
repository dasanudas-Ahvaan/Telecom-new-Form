import ExtraFields from "../ExtraFields";
import Input from "../Input";

export default function StepTwo({
  loading,
  formData,
  handleChange,
  submitForm,
  message,
  exFields = [],
}) {
  return (
    <form
      onSubmit={submitForm}
      className="space-y-10 bg-white p-6 rounded-xl shadow-md"
    >
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
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <div className="">
            <label className="font-normal text-gray-400 text-lg py-[0.4rem]">
              Gender{"*"}
            </label>
            <select
              name="gender"
              value={formData["gender"]}
              onChange={handleChange}
              className="font-light dark:bg-violet-900 bg-gray-900 w-full max-w-sm focus:outline-none md:text-[20px]/8  rounded-md px-1 pt-[0.8rem] pb-[0.8rem]  placeholder-crypto_violet dark:placeholder-gray-400 capitalize text-gray-400"
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
          </div>
          <Input
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
          <Input
            label="Aadhar Number"
            name="aadhar"
            value={formData.aadhar}
            onChange={handleChange}
            required
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
          />
          <Input
            label="Profession"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            required
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
          />
          <Input
            label="Address Line 2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            required
          />
          <Input
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
          />
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
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
          />
          <Input
            label="Volunteer Programs"
            name="volunteerPrograms"
            value={formData.volunteerPrograms}
            onChange={handleChange}
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
