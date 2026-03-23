import { useState, useRef, useEffect } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { XIcon, ChevronDownIcon, CheckIcon } from "./icons";

/**
 * MultiSelect Component
 *
 * @param {Object} props
 * @param {Array} props.options - Array of option objects: { value: any, label: string, disabled?: boolean }
 * @param {Array} props.selected - Array of currently selected option objects
 * @param {Function} props.onChange - Callback function when selection changes (returns new array)
 * @param {string} [props.placeholder] - Placeholder text when nothing is selected
 * @param {string} [props.label] - Label text for accessibility
 * @param {string} [props.id] - ID for accessibility association
 * @param {string} [props.className] - Additional Tailwind classes for the container
 * @param {boolean} [props.disabled] - Disable the entire component
 */
export function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Select items...",
  label,
  id,
  className = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);

  // Close when clicking outside
  useClickOutside(containerRef, () => setIsOpen(false));

  // Handle Option Toggle
  const toggleOption = (option) => {
    if (disabled || option.disabled) return;

    const isSelected = selected.some((item) => item.value === option.value);
    let newSelected;

    if (isSelected) {
      newSelected = selected.filter((item) => item.value !== option.value);
    } else {
      newSelected = [...selected, option];
    }

    onChange(newSelected);
    // Keep focus on the listbox for keyboard navigation continuity
    listboxRef.current?.focus();
  };

  // Remove specific selected item (Chip removal)
  const removeSelected = (e, value) => {
    e.stopPropagation(); // Prevent triggering the dropdown toggle
    if (disabled) return;
    const newSelected = selected.filter((item) => item.value !== value);
    onChange(newSelected);
  };

  // Keyboard Navigation Support
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {/* Semantic Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-md font-medium text-gray-400 mb-1 truncate"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={label ? id : undefined}
        id={id}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative flex flex-wrap items-center gap-1 min-h-12 w-full 
          rounded-md border bg-gray-900 
          px-4 py-3 text-left shadow-sm cursor-pointer
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500
          ${disabled ? "bg-gray-900 text-gray-400 cursor-not-allowed" : "hover:border-gray-400"}
          ${isOpen ? "border-gray-500 ring-1 ring-gray-500" : "border-gray-300 dark:border-gray-600"}
        `}
      >
        {/* Selected Items (Chips) */}
        {selected.length > 0 ? (
          selected.map((item, index) => (
            <span
              key={String(index + "" + item.value)}
              className="inline-flex items-center gap-1 rounded-full bg-gray-700/50 px-2 py-1 text-xs font-medium text-gray-300"
            >
              {item.value}
              <button
                type="button"
                onClick={(e) => removeSelected(e, item.value)}
                className="rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-500"
                aria-label={`Remove ${item.label}`}
              >
                <XIcon />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-md pointer-events-none">
            {placeholder}
          </span>
        )}

        {/* Dropdown Arrow */}
        <div className="ml-auto text-gray-400">
          <ChevronDownIcon />
        </div>
      </div>

      {/* Dropdown Menu (Listbox) */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          aria-multiselectable="true"
          tabIndex={-1}
          className={`
            absolute z-50 mt-2 max-h-60 w-72 overflow-auto rounded-md 
            bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 
            focus:outline-none sm:text-sm
            animate-in fade-in zoom-in-95 duration-100
          `}
        >
          {options.length === 0 ? (
            <li className="relative cursor-default select-none py-2 px-4 text-gray-500">
              No options available
            </li>
          ) : (
            options.map((option) => {
              const isSelected = selected.some(
                (item) => item.value === option.value,
              );
              const isDisabled = option.disabled || disabled;

              return (
                <li
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleOption(option)}
                  className={`
                    relative cursor-pointer select-none py-2 px-8
                    ${isDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-400"}
                    ${isSelected ? "bg-gray-200/20" : "hover:bg-gray-700"}
                  `}
                >
                  {/* Checkmark Icon */}
                  <span
                    className={`
                      absolute inset-y-0 left-0 flex items-center pl-2
                      ${isSelected ? "text-gray-400" : "text-transparent"}
                    `}
                  >
                    <CheckIcon />
                  </span>

                  {/* Label */}
                  <span
                    className={`block truncate ${isSelected ? "font-semibold" : "font-normal"}`}
                  >
                    {option.label}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
