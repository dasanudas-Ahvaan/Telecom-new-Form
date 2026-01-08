import Input from "./Input"; 

const ExtraFields = ({ exFields, formData, handleChange }) => {
  return (
    <>
      {exFields.map((field) => {
        if (field.type !== "checkbox" && field.type !== "select") {
          return (
            <Input
              key={field._id}
              label={field.label}
              onChange={handleChange}
              name={field.label}
              required={field.required}
              type={field.type}
              value={formData.extraFields[field.label] || ""}
            />
          );
        }

        if (field.type === "select") {
          return (
            /* Changed text-gray-400 to text-black */
            <label key={field._id} className="flex flex-col gap-1 text-black font-medium">
              <span>
                {field.label}
                {field.required && "*"}
              </span>

              <select
                name={field.label}
                value={formData.extraFields[field.label] || ""}
                onChange={handleChange}
                required={field.required}
                /* Changed bg-gray-900 to bg-white and added text-black */
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white text-black"
              >
                <option value="" className="text-black">Select</option>
                {field.options && field.options.length > 0 &&
                  field.options.map((option, idx) => (
                    <option key={idx} value={option.trim()} className="text-black">
                      {option.trim()}
                    </option>
                  ))}
              </select>
            </label>
          );
        }

        if (field.type === "checkbox") {
          return (
            /* Changed text-gray-400 to text-black */
            <label key={field._id} className="flex items-center gap-2 text-black font-medium">
              <input
                type="checkbox"
                name={field.label}
                checked={formData.extraFields[field.label] || false}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: field.label,
                      value: e.target.checked,
                    },
                  })
                }
                /* Changed bg-gray-900 to bg-white */
                className="h-5 w-5 rounded border-gray-300 focus:ring-2 focus:ring-red-500 bg-white"
              />
              <span>
                {field.label}
                {field.required && "*"}
              </span>
            </label>
          );
        }
        return null;
      })}
    </>
  );
};

export default ExtraFields;