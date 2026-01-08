function Input({ label, name, value, onChange, type = "text", required }) {
  return (
    /* Changed text-gray-400 to text-black */
    <label className="flex flex-col gap-1 text-black font-medium">
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
        /* Changed bg-gray-900 to bg-white and added text-black */
        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white text-black placeholder:text-gray-400"
      />
    </label>
  );
}
export default Input;