import { useState } from "react";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, KeyIcon, RefreshIcon } from "../icons";
import Loader from "../Loader";
import { generateStrongPassword } from "../../utils/generatePass";

export const ResetPasswordModal = ({ isOpen, onClose, admin, onReset, isLoading }) => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGenerate = () => {
    setNewPassword(generateStrongPassword());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
  };

  const handleSubmit = () => {
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    onReset(admin._id, newPassword);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-900/30 rounded-lg text-orange-500">
            <KeyIcon />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Reset Password</h3>
            <p className="text-gray-400 text-sm">{admin?.email}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-4 pr-20 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                title={showPassword ? "Hide" : "Show"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Copy"
              >
                <CopyIcon />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-2.5 mb-4 rounded-xl font-medium text-white bg-gray-700 hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
        >
          <RefreshIcon />
          <span>Generate Strong Password</span>
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-gray-700 hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader /> : <CheckIcon />}
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};