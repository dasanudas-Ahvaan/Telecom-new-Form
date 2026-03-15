import { useEffect } from "react";

export default function Modal({
  isOpen = false,
  onClose,
  title,
  message,
  children,
  showCloseButton = true,
  closeOnOverlay = true,
  size = "md", // sm, md, lg, xl, full
  type = "default", // default, success, warning, error, info
}) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  const typeStyles = {
    default: "border-gray-200",
    success: "border-green-500",
    warning: "border-yellow-500",
    error: "border-red-500",
    info: "border-blue-500",
  };

  const headerColors = {
    default: "text-gray-900",
    success: "text-green-700",
    warning: "text-yellow-700",
    error: "text-red-700",
    info: "text-blue-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-orange-200 border-t-4 ${typeStyles[type]} rounded-t-xl rounded-xl shadow-2xl w-full ${sizeClasses[size]} mx-4 transform transition-all ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Border based on type */}
        {/* <div className={`border-t-4 ${typeStyles[type]} rounded-t-xl`} /> */}

        {/* Header */}
        {(title || showCloseButton) && (
          <header className="flex items-center justify-between p-5 border-b border-gray-100">
            {title && (
              <h3 className={`text-xl font-semibold ${headerColors[type]}`}>
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </header>
        )}

        {/* Body */}
        <div className="p-5">
          {message && (
            <p className="text-gray-600 mb-4 leading-relaxed">{message}</p>
          )}
          {children && <div>{children}</div>}
        </div>

        {/* Footer (if children contains buttons) */}
        {children && (
          <footer className="px-5 pb-5 pt-2 border-t border-gray-100">
            {children}
          </footer>
        )}
      </div>
    </div>
  );
}