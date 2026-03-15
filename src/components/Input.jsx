function Input({ label, name, value, onChange, type = "text", required, error }) {
  return (
    <label className="flex flex-col gap-1 text-gray-400">
      <span className={error ? "text-red-500" : ""}>
        {label}
        {required && "*"}
      </span>
      <input
        placeholder={label}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`p-3 border rounded-lg focus:ring-2 bg-gray-900 focus:outline-none ${
          error
            ? "border-red-500 focus:ring-red-500 text-red-100"
            : "focus:ring-red-500 text-gray-200"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </label>
  );
}

export default Input;


