function Input({ label, name, value, onChange, type = "text", required }) {
  return (
    <label className="flex flex-col gap-1 text-gray-400">
      <span>
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
        className="p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-900"
      />
    </label>
  );
}
export default Input;
