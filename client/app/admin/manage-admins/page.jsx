// client/app/admin/manage-admins/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import { jwtDecode } from 'jwt-decode'; // Correct for v4 // default import

export default function ManageAdminsPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [adminList, setAdminList] = useState([]);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [currentAdminRole, setCurrentAdminRole] = useState(null); // Owner | Admin
  const [deletingAdminId, setDeletingAdminId] = useState(null);

  const router = useRouter();
  const getToken = () => localStorage.getItem("admin-token");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    // decode token
    let decoded = null;
    try {
      decoded = jwtDecode(token);
      // adapt to the shape you use in your backend token
      setCurrentAdminId(decoded.id || decoded._id || null);
      setCurrentAdminRole(decoded.role || decoded.Roles || null);
    } catch (e) {
      console.error("Invalid token:", e);
      localStorage.removeItem("admin-token");
      router.push("/admin/login");
      return;
    }

    // If current user is Owner, fetch admin list; otherwise skip
    if ((decoded.role || decoded.Roles) === "Owner" || decoded.role === "Owner") {
      const fetchAdmins = async () => {
        setLoadingList(true);
        setError("");
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const res = await axios.get(`${apiUrl}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.success) {
            setAdminList(res.data.admins || []);
          } else {
            setError(res.data?.message || "Failed to load admin list.");
          }
        } catch (err) {
          console.error("Fetch admins error:", err);
          setError(err.response?.data?.message || "Error loading admin list.");
          if (err.response?.status === 401) router.push("/admin/login");
        } finally {
          setLoadingList(false);
        }
      };
      fetchAdmins();
    } else {
      // not Owner -> stop loading and show limited UI
      setLoadingList(false);
    }
    // only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Create admin (Owner-only action)
  const onSubmitCreate = async (data) => {
    setLoadingCreate(true);
    setError("");
    setSuccessMessage("");

    const token = getToken();
    if (!token) {
      setError("Authentication error.");
      setLoadingCreate(false);
      router.push("/admin/login");
      return;
    }

    // Basic client-side validation
    if (!data.email) {
      setError("Email is required.");
      setLoadingCreate(false);
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      setLoadingCreate(false);
      return;
    }
    if (data.password?.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoadingCreate(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.post(
        `${apiUrl}/api/admin/create-admin`,
        { email: data.email, password: data.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setSuccessMessage(`Admin user "${data.email}" created successfully!`);
        reset();

        // refresh admin list if Owner
        try {
          const newListRes = await axios.get(`${apiUrl}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (newListRes.data?.success) {
            setAdminList(newListRes.data.admins || []);
          }
        } catch (err) {
          // non-fatal: list refresh failed
          console.error("Refresh admin list failed:", err);
        }
      } else {
        setError(res.data?.message || "Failed to create admin.");
      }
    } catch (err) {
      console.error("Create admin error:", err);
      setError(err.response?.data?.message || "Error creating admin.");
      if (err.response?.status === 401) router.push("/admin/login");
    } finally {
      setLoadingCreate(false);
    }
  };

  // Delete admin (Owner-only)
  const handleDeleteAdmin = async (adminId, adminEmail) => {
    // Prevent deleting self
    if (adminId === currentAdminId) {
      alert("Cannot delete your own account.");
      return;
    }

    if (!confirm(`Delete admin "${adminEmail}"?`)) return;

    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setDeletingAdminId(adminId);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.delete(`${apiUrl}/api/admin/users/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        // remove from list
        setAdminList((prev) => prev.filter((a) => a._id !== adminId));
        alert("Admin deleted.");
      } else {
        setError(res.data?.message || "Failed to delete admin.");
      }
    } catch (err) {
      console.error("Delete admin error:", err);
      setError(err.response?.data?.message || "Error deleting admin.");
      if (err.response?.status === 401) router.push("/admin/login");
    } finally {
      setDeletingAdminId(null);
    }
  };

  // Render
  return (
    <div className="max-w-xl mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Manage Admins</h1>
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      {/* Only Owners see the create form */}
      {currentAdminRole === "Owner" && (
        <form
          onSubmit={handleSubmit(onSubmitCreate)}
          className="space-y-6 mb-8 border-b pb-8"
        >
          <h2 className="text-xl font-semibold text-gray-700">
            Create New Admin
          </h2>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              New Admin Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "Email is required" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="new.admin@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", { required: "Please confirm password" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {successMessage && <p className="text-sm text-green-600 text-center">{successMessage}</p>}

          <div>
            <button
              type="submit"
              disabled={loadingCreate}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {loadingCreate ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      )}

      {/* Admin list (only Owner can see the full list and delete) */}
      {currentAdminRole === "Owner" && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Existing Admins</h2>

          {loadingList && <p className="text-gray-600">Loading admin list...</p>}
          {!loadingList && adminList.length === 0 && (
            <p className="text-sm text-gray-500">No admin users found.</p>
          )}

          {!loadingList && adminList.length > 0 && (
            <ul className="space-y-3">
              {adminList.map((admin) => (
                <li
                  key={admin._id}
                  className="flex justify-between items-center p-3 bg-gray-50 border rounded-md"
                >
                  <div>
                    <span className="font-medium text-gray-900">{admin.email}</span>
                    <span className="text-sm text-gray-500 ml-2">({admin.role || "Admin"})</span>
                  </div>

                  <button
                    onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                    disabled={
                      admin._id === currentAdminId ||
                      loadingList ||
                      deletingAdminId === admin._id
                    }
                    className={`px-3 py-1 text-sm font-medium rounded shadow-sm transition-colors duration-150 ${
                      admin._id === currentAdminId
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : loadingList || deletingAdminId === admin._id
                        ? "bg-gray-400 text-white cursor-wait"
                        : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    }`}
                  >
                    {deletingAdminId === admin._id ? "Deleting..." : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* If user is an Admin (not Owner), show a friendly message */}
      {currentAdminRole && currentAdminRole !== "Owner" && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700">Manage Admins</h2>
          <p className="text-gray-500 mt-2">
            You do not have permission to manage other admin accounts. This is an Owner-only feature.
          </p>
        </div>
      )}
    </div>
  );
}
