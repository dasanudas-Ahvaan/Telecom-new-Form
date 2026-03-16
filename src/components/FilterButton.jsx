export const FilterButton = ({
  active,
  onClick,
  children,
  count,
  color = "orange", 
  className,
}) => {
  const colorStyles = {
    orange: active
      ? "bg-orange-600 text-white shadow-lg shadow-orange-900/30 border-2 border-orange-500"
      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-2 border-orange-500",
    green: active
      ? "bg-green-600 text-white shadow-lg shadow-green-900/30 border-2 border-green-500"
      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-2 border-green-500",
    red: active
      ? "bg-red-600 text-white shadow-lg shadow-red-900/30 border-2 border-red-500"
      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-2 border-red-500",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${colorStyles[color]} ${className}`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            active ? "bg-white/20" : "bg-gray-700"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};