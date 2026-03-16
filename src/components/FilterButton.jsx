export const FilterButton = ({
  active,
  onClick,
  children,
  count,
  className,
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
      active
        ? "bg-orange-400 text-white shadow-lg shadow-orange-900/30"
        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
    } ${className}`}
  >
    {children}
    {count !== undefined && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-orange-500/30" : "bg-gray-700"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);
