import Input from "./Input"; 

const ExtraFields = ({ exFields, formData, handleChange }) => {
  return (
    <>
      {exFields.map((field) => {
        
        // -------- TEXT / NUMBER / EMAIL / DATE ----------
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

        // -------- SELECT ----------
        if (field.type === "select") {
          return (
            <label key={field._id} className="flex flex-col gap-1 text-gray-400">
              <span>
                {field.label}
                {field.required && "*"}
              </span>

              <select
                name={field.label}
                value={formData.extraFields[field.label] || ""}
                onChange={handleChange}
                required={field.required}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-900"
              >
                <option value="">Select</option>

                {field.options && field.options.length > 0 &&
                  field.options.map((option, idx) => (
                    <option key={idx} value={option.trim()}>
                      {option.trim()}
                    </option>
                  ))}
              </select>
            </label>
          );
        }

        // -------- CHECKBOX ----------
        if (field.type === "checkbox") {
          return (
            <label key={field._id} className="flex items-center gap-2 text-gray-400">
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
                className="h-5 w-5 rounded focus:ring-2 focus:ring-red-500 bg-gray-900"
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
