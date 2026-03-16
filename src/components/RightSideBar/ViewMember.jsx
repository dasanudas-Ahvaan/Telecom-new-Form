import { useEffect } from "react";

const ViewMember = ({ isOpen, onClose, member, handleEdit }) => {
  const handleOutSideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!member) return null;

  const formatKey = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const renderValue = (key, value) => {
    if (key === "dateOfBirth") return new Date(value).toDateString();
    if (key === "isVerified")
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? "bg-green-900/30 text-green-400 border border-green-900/50"
              : "bg-orange-800 text-orange-400 border border-orange-700"
          }`}
        >
          {value ? "Verified" : "Not Verified"}
        </span>
      );
    if (key === "status")
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === "active"
              ? "bg-green-900/30 text-green-400 border border-green-900/50"
              : "bg-orange-800 text-orange-400 border border-orange-700"
          }`}
        >
          {value === "active" ? "Active" : "Inactive"}
        </span>
      );
    return value || "N/A";
  };

  const standardFields = Object.entries(member).filter(
    ([key]) =>
      !["_id", "extraFields", "createdAt", "updatedAt", "__v"].includes(key),
  );

  const extraFields = member.extraFields
    ? Object.entries(member.extraFields)
    : [];

  return (
    <>
      {/* Outer Overlay - Handles Fade In/Out */}
      <div
        className={`fixed inset-0 z-1000 bg-black/60 flex justify-end transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleOutSideClick}
      >
        {/* Inner Sidebar - Handles Slide Animation */}
        <div
          className={`bg-gray-900 fixed top-0 right-0 font-jose w-[50vw] max-[915px]:w-[80vw] border-l-4 border-orange-500 h-screen pl-6 text-left flex flex-col items-start justify-start gap-6 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full pr-6 pt-6 pb-4 border-b border-gray-800 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Member Details
              </h2>
              <p className="text-orange-600 text-lg mt-1">
                {member.fullName || "Member Profile"} - {member.phone}
              </p>
            </div>
            <div className="flex gap-4 flex-col sm:flex-row items-end sm:items-start">
              <button
                onClick={() => {
                  handleEdit(member);
                  onClose();
                }}
                className="rounded px-2 sm:self-stretch tracking-tighter bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 active:scale-[0.98]"
              >
                Edit Member
              </button>
              <button
                onClick={onClose}
                className="p-2 w-max text-gray-400 hover:text-white bg-red-900 hover:bg-red-800 rounded-full transition-colors"
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content - Two Column Layout */}
          <div className="w-full pr-6 flex flex-col gap-4">
            {/* Standard Fields */}
            {standardFields.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-orange-500 uppercase tracking-wider pb-2 border-b border-gray-800">
                  General Information
                </h3>
                {standardFields.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-3 gap-4 items-start py-3 border-b border-gray-800/50 hover:bg-gray-800/30 rounded-lg px-3 transition-colors"
                  >
                    <div className="col-span-1">
                      <p className="text-sm font-medium text-gray-500 capitalize">
                        {formatKey(key)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-base text-gray-200 wrap-break-words">
                        {renderValue(key, value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Extra Fields */}
            {extraFields.length > 0 && (
              <div className="space-y-2 pt-4">
                <h3 className="text-xs font-semibold text-purple-500 uppercase tracking-wider pb-2 border-b border-gray-800">
                  Additional Details
                </h3>
                {extraFields.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-3 gap-4 items-start py-3 border-b border-gray-800/50 hover:bg-gray-800/30 rounded-lg px-3 transition-colors"
                  >
                    <div className="col-span-1">
                      <p className="text-sm font-medium text-gray-500 capitalize">
                        {formatKey(key)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-base text-gray-200 wrap-break-words">
                        {value || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="w-full pr-6 pt-4 pb-8 border-t border-gray-800 shrink-0">
            <button
              onClick={() => {
                handleEdit(member);
                onClose();
              }}
              className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 active:scale-[0.98]"
            >
              Edit Member
            </button>
          </div>
        </div>
      </div>
     
    </>
  );
};

export default ViewMember;
