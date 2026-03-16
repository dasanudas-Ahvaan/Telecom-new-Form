import { useState } from "react";
import { CheckIcon, CopyIcon } from "../icons";

export const PasswordModal = ({ isOpen, onClose, password, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-900/30 rounded-lg">
            <CheckIcon />
          </div>
          <h3 className="text-xl font-semibold text-white">Admin Created!</h3>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Please save this password securely. It won't be shown again.
        </p>

        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between gap-2">
            <code className="text-green-400 font-mono text-sm break-all">
              {password}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Copy Password"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        {copied && (
          <p className="text-green-400 text-sm text-center mb-4">
            ✓ Password copied to clipboard!
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
