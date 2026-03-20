import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext/AuthContext";
import {
  createAdmin,
  removeAdmin,
  resetAdminPassword,
  getAllAdmins,
} from "../api/AdminManagement";
import Loader from "../components/Loader";
import NoAccess from "./NoAccess";
import {
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  CopyIcon,
  CheckIcon,
  KeyIcon,
  RefreshIcon,
  UserPlusIcon,
  TrashIcon,
} from "../components/icons";
import { generateStrongPassword } from "../utils/generatePass";
import { PasswordModal } from "../components/Modals/PasswordModal";
import { ResetPasswordModal } from "../components/Modals/ResetPasswordModal";
import Modal from "../components/Modal";

export default function AdminManagement() {
  const { token, user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState("");
  const [resetModal, setResetModal] = useState({ open: false, admin: null });

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await getAllAdmins(token, user?._id);
      if (response.success) {
        setAdmins(response.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError("Email, name and password are required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await createAdmin(
        token,
        user?._id,
        email,
        password,
        name,
      );
      if (response.success) {
        setCreatedPassword(password);
        setShowPasswordModal(true);
        setEmail("");
        setPassword("");
        setName("");
        setSuccess("Admin created successfully!");
        fetchAdmins();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId, adminEmail) => {
    if (
      !window.confirm(
        `Are you sure you want to remove admin "${adminEmail}"? This action cannot be undone.`,
      )
    )
      return;

    try {
      setIsLoading(true);
      setError("");
      const response = await removeAdmin(token, user?._id, adminId);
      if (response.success) {
        setSuccess("Admin removed successfully!");
        fetchAdmins();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      {
        setIsLoading(false);
      }
    }
  };

  const handleResetPassword = async (adminId, newPassword) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await resetAdminPassword(
        token,
        user?._id,
        adminId,
        newPassword,
      );
      if (response.success) {
        setSuccess("Password reset successfully!");
        setResetModal({ open: false, admin: null });

        fetchAdmins();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is super_user
  if (user?.role !== "super_user") {
    return <NoAccess />;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 text-left">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-linear-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-900/20">
            <ShieldIcon />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Admin Management
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Create and manage admin accounts
            </p>
          </div>
        </div>

        {/* Messages */}
        {/* {(error || success) && (
          <div
            className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
              error
                ? "bg-red-900/30 border-red-800 text-red-400"
                : "bg-green-900/30 border-green-800 text-green-400"
            }`}
          >
            <p className="text-sm font-medium">{error || success}</p>
          </div>
        )} */}

        {/* Create Admin Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlusIcon />
            Create New Admin
          </h3>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 pr-20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                    minLength="8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                      title={showPassword ? "Hide" : "Show"}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassword(generateStrongPassword())}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="Generate Strong Password"
                    >
                      <RefreshIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <UserPlusIcon />
                  <span>Create Admin</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Admins List */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-2 sm;p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldIcon />
            Existing Admins ({admins.length})
          </h3>

          {isLoading && admins.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
                <ShieldIcon />
              </div>
              <p className="text-gray-400 font-medium">No admins yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Create your first admin above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin._id}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-2 sm:p-4 flex items-center justify-between flex-wrap gap-4 hover:border-orange-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                    <div className="w-5 h-5 sm:w-10 sm:h-10 bg-linear-to-br from-orange-500/20 to-red-600/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-500 font-extralight sm:font-semibold">
                        {admin.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs sm:text-base font-normal sm:font-medium truncate sm:truncate-None">
                        {admin.email}
                      </p>

                      <p className="text-gray-500 text-xs sm:text-base font-normal">
                        {admin.name || "name of admin (missing)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setResetModal({ open: true, admin: admin })
                      }
                      className="p-1 sm:p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-900/30 rounded-lg transition-all duration-200 border"
                      title="Reset Password"
                    >
                      <KeyIcon />
                    </button>
                    <button
                      onClick={() => handleRemoveAdmin(admin._id, admin.email)}
                      className="p-1 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200 border"
                      title="Remove Admin"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          password={createdPassword}
        />

        <ResetPasswordModal
          isOpen={resetModal.open}
          onClose={() => setResetModal({ open: false, admin: null })}
          admin={resetModal.admin}
          onReset={handleResetPassword}
          isLoading={isLoading}
        />

        <Modal
          isOpen={error}
          onClose={() => setError("")}
          title={"Error Occured"}
          message={error}
          type={"error"}
          size="md"
          closeOnOverlay={error}
        />
        <Modal
          isOpen={success}
          onClose={() => setSuccess("")}
          title={"Operation Successfull"}
          message={success}
          type={"success"}
          size="md"
          closeOnOverlay={success}
        />
      </div>
    </div>
  );
}
