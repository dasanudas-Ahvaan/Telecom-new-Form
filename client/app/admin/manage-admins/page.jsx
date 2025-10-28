// client/app/admin/manage-admins/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode'; // Import to check current admin ID

export default function ManageAdminsPage() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loadingCreate, setLoadingCreate] = useState(false); // Separate loading state for creation
    const [loadingList, setLoadingList] = useState(true); // Loading state for list
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [adminList, setAdminList] = useState([]); // State for admin list
    const [currentAdminId, setCurrentAdminId] = useState(null); // State for logged-in admin's ID
    const router = useRouter();

    // Helper state variable - moved inside component state
    const [deletingAdminId, setDeletingAdminId] = useState(null);

    const getToken = () => localStorage.getItem('admin-token');

    // --- Fetch Admin List and Get Current Admin ID ---
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/admin/login');
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            setCurrentAdminId(decodedToken.id);
        } catch (e) {
            console.error("Invalid token:", e);
            localStorage.removeItem('admin-token');
            router.push('/admin/login');
            return;
        }

        const fetchAdmins = async () => {
            setLoadingList(true);
            setError('');
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.get(`${apiUrl}/api/admin/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data.success) {
                    setAdminList(res.data.admins);
                } else {
                    setError('Failed to load admin list.');
                }
            } catch (err) {
                console.error("Fetch admins error:", err);
                setError(err.response?.data?.message || 'Error loading admin list.');
                if (err.response?.status === 401) router.push('/admin/login');
            } finally {
                setLoadingList(false);
            }
        };
        fetchAdmins();
    }, [router]);

    // --- Handle Create Admin Form Submission ---
    const onSubmitCreate = async (data) => {
        setLoadingCreate(true);
        setError('');
        setSuccessMessage('');
        const token = getToken();
        if (!token) {
             setError('Authentication error.');
             setLoadingCreate(false);
             router.push('/admin/login');
             return;
        }
        if (data.password !== data.confirmPassword) {
            setError('Passwords do not match.');
            setLoadingCreate(false);
            return;
        }
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.post(`${apiUrl}/api/admin/create-admin`,
            { email: data.email, password: data.password },
            { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (res.data.success) {
                setSuccessMessage(`Admin user "${data.email}" created successfully!`);
                reset();
                 const newListRes = await axios.get(`${apiUrl}/api/admin/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                 if (newListRes.data.success) {
                    setAdminList(newListRes.data.admins);
                 }
            } else { setError(res.data.message || 'Failed.'); }
        } catch (err) {
            console.error("Create admin error:", err);
            setError(err.response?.data?.message || 'Error.');
             if (err.response?.status === 401) router.push('/admin/login');
        } finally { setLoadingCreate(false); }
    };

    // --- Handle Delete Admin ---
    const handleDeleteAdmin = async (adminId, adminEmail) => {
        if (adminId === currentAdminId) {
            alert("Cannot delete own account.");
            return;
        }
        if (confirm(`Delete admin "${adminEmail}"?`)) {
            setDeletingAdminId(adminId); // Set which admin is being deleted for loading text
            setError('');
            const token = getToken();
            if (!token) { router.push('/admin/login'); setDeletingAdminId(null); return; }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.delete(`${apiUrl}/api/admin/users/${adminId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data.success) {
                    alert(`Admin deleted.`);
                    setAdminList(prevList => prevList.filter(admin => admin._id !== adminId));
                } else { setError(res.data.message || 'Failed.'); }
            } catch (err) {
                console.error("Delete admin error:", err);
                setError(err.response?.data?.message || 'Error.');
                if (err.response?.status === 401) router.push('/admin/login');
            } finally { setDeletingAdminId(null); } // Clear deleting state
        }
    };

    // Note: No top-level <main> tag here, as RootLayout provides it.
    return (
        // 1. Container div with appropriate max-width and styling, default text dark
        <div className="max-w-xl mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
            <div className="flex justify-between items-center mb-6">
                {/* Ensure heading text is dark */}
                <h1 className="text-3xl font-bold text-blue-800">Manage Admins</h1>
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
            </div>

            {/* --- Create Admin Form --- */}
            <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-6 mb-8 border-b pb-8">
                 {/* Ensure heading text is dark */}
                <h2 className="text-xl font-semibold text-gray-700">Create New Admin</h2>
                 <div>
                    {/* Ensure label text is dark */}
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">New Admin Email</label>
                    <input type="email" id="email" {...register("email", { required: "Email is required" })}
                        // 2. Add text color and placeholder color classes
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                        placeholder="new.admin@example.com"/>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                 <div>
                    {/* Ensure label text is dark */}
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                        // 2. Add text color and placeholder color classes
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                        placeholder="••••••••"/>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>
                 <div>
                    {/* Ensure label text is dark */}
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" id="confirmPassword" {...register("confirmPassword", { required: "Please confirm password" })}
                        // 2. Add text color and placeholder color classes
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                        placeholder="••••••••"/>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>

                {/* Shared error/success messages for create form */}
                {/* Ensure text is dark unless explicitly colored */}
                {error && !loadingList && <p className="text-sm text-red-600 text-center">{error}</p>}
                {successMessage && <p className="text-sm text-green-600 text-center">{successMessage}</p>}

                <div>
                    <button type="submit" disabled={loadingCreate}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                        {loadingCreate ? 'Creating...' : 'Create Admin'}
                    </button>
                </div>
            </form>

             {/* --- Existing Admins List --- */}
             <div className="mt-8">
                 {/* Ensure heading text is dark */}
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Existing Admins</h2>
                 {/* Ensure loading text is dark */}
                 {loadingList && <p className="text-gray-600">Loading admin list...</p>}
                 {/* Error text is already red */}
                 {error && loadingList && <p className="text-sm text-red-600 text-center">{error}</p>}

                 {/* Ensure message text is dark */}
                 {!loadingList && adminList.length === 0 && <p className="text-sm text-gray-500">No admin users found.</p>}

                 {!loadingList && adminList.length > 0 && (
                     <ul className="space-y-3">
                         {adminList.map(admin => (
                             <li key={admin._id} className="flex justify-between items-center p-3 bg-gray-50 border rounded-md">
                                 <div>
                                     {/* 3. Ensure list item text is dark */}
                                     <span className="font-medium text-gray-900">{admin.email}</span>
                                     <span className="text-sm text-gray-500 ml-2">({admin.role || 'Admin'})</span>
                                 </div>
                                 <button
                                     onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                                     // Disable if this admin is being deleted OR if list is loading
                                     disabled={admin._id === currentAdminId || loadingList || deletingAdminId === admin._id}
                                     className={`px-3 py-1 text-sm font-medium rounded shadow-sm transition-colors duration-150 ${
                                        admin._id === currentAdminId
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' // Self
                                            : loadingList || deletingAdminId === admin._id
                                                ? 'bg-gray-400 text-white cursor-wait' // Loading/Deleting
                                                : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500' // Normal Delete
                                     }`}
                                 >
                                    {/* Show "Deleting..." text on the specific button being processed */}
                                    {deletingAdminId === admin._id ? 'Deleting...' : 'Delete'}
                                 </button>
                             </li>
                         ))}
                     </ul>
                 )}
             </div>
        </div>
    );
}