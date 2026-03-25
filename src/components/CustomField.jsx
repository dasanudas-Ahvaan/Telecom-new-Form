import { useState, useEffect } from "react";
import {
  createCustomField,
  deleteCustomField,
  getCustomFields,
} from "../api/CustomField";
import { useAuth } from "../authContext/AuthContext";
import Loader from "./Loader";
import { FieldIcon, PlusIcon, TrashIcon } from "./icons";

export default function CustomFields() {
  const { user } = useAuth();

  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({
    label: "",
    type: "text",
    required: false,
    options: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchFields();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchFields = async () => {
    try {
      const response = await getCustomFields();
      setFields(response?.data || []);
    } catch (err) {
      setError("Failed to load custom fields");
    }
  };

  const createField = async () => {
    if (!form.label.trim()) {
      setError("Label is required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const payload = { ...form };
      if (form.type !== "select") {
        payload.options = [];
      } else {
        payload.options = form.options
          .split(",")
          .map((o) => o.trim())
          .filter((o) => o);
      }

      await createCustomField(payload, user?._id);
      setSuccess("Field created successfully!");
      setForm({ label: "", type: "text", required: false, options: "" });
      fetchFields();
    } catch (err) {
      setError(err.message || "Failed to create field");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteField = async (id) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      await deleteCustomField(id, user?._id);
      setSuccess("Field deleted successfully!");
      fetchFields();
    } catch (err) {
      setError(err.message || "Failed to delete field");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      text: "bg-blue-900/30 text-blue-400 border-blue-900/50",
      number: "bg-green-900/30 text-green-400 border-green-900/50",
      email: "bg-purple-900/30 text-purple-400 border-purple-900/50",
      date: "bg-orange-900/30 text-orange-400 border-orange-900/50",
      select: "bg-pink-900/30 text-pink-400 border-pink-900/50",
      checkbox: "bg-cyan-900/30 text-cyan-400 border-cyan-900/50",
    };
    return colors[type] || "bg-gray-800 text-gray-400 border-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-linear-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-900/20">
            <FieldIcon />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Manage Custom Fields
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Create and manage custom fields for member registration
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(error || success) && (
          <div
            className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
              error
                ? "bg-red-900/30 border-red-800 text-red-400"
                : "bg-green-900/30 border-green-800 text-green-400"
            }`}
          >
            <p className="text-sm font-medium">{error || success}</p>
          </div>
        )}

        {/* Create Field Form */}
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <PlusIcon />
          Add New Field
        </h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="space-y-4">
            {/* Label */}
            <div className="text-left">
              <label className="block text-sm font-medium text-orange-400 mb-2">
                Field Label
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g., Emergency Contact"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Data Type */}
            <div className="text-left">
              <label className="block text-sm font-medium text-orange-400 mb-2">
                Data Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
                <option value="date">Date</option>
                <option value="select">Select (Dropdown)</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>

            {/* Options (for Select) */}
            {form.type === "select" && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Options{" "}
                  <span className="text-gray-500">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={form.options}
                  onChange={(e) =>
                    setForm({ ...form, options: e.target.value })
                  }
                  placeholder="e.g., Option 1, Option 2, Option 3"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Required Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.required}
                  onChange={(e) =>
                    setForm({ ...form, required: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-400">
                  Required Field
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={createField}
              disabled={isLoading || !form.label.trim()}
              className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusIcon />
                  <span>Add Field</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Existing Fields List */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FieldIcon />
            Existing Fields ({fields.length})
          </h3>

          {fields.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
                <FieldIcon />
              </div>
              <p className="text-gray-400 font-medium">No custom fields yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Create your first field above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((f) => (
                <div
                  key={f._id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-orange-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-start gap-4">
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getTypeBadgeColor(f.type)}`}
                    >
                      {f.type}
                    </div>
                    <div className="flex gap-1">
                      <p className="text-white font-medium">{f.label}</p>
                      {f.required && (
                        <sup className="inline-flex items-center gap-1 text-xs text-orange-400">
                          * Required
                        </sup>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteField(f._id)}
                    disabled={isLoading}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Delete Field"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
