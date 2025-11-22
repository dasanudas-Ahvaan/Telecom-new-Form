// client/app/admin/inactive-users/page.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Searchbar from '@/app/components/Searchbar';
import Pagination from '@/app/components/Pagination';

export default function InactiveUsersPage() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- Bulk Selection State ---
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false); // Shared loading for actions
    
    // Search & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();
    const getToken = () => localStorage.getItem('admin-token');

    // --- Fetch Data ---
    const fetchData = useCallback(async (page = 1, query = '') => {
        setLoading(true);
        setError('');
        const token = getToken();
        if (!token) { 
            router.push('/admin/login'); 
            return; 
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.get(`${apiUrl}/api/admin/inactive-users`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { page, limit: 10, search: query }
            });

            if (res.data.success) {
                const currentSelected = new Set(selectedIds);
                const fetched = res.data.registrations.map(reg => ({
                    ...reg,
                    isSelected: currentSelected.has(reg.registrationId)
                }));

                setRegistrations(fetched);
                setCurrentPage(res.data.pagination.page);
                setTotalPages(res.data.pagination.totalPages);

                if (fetched.length === 0) {
                    setError(query ? `No results for "${query}".` : 'No inactive users found.');
                }
            } else { 
                setError(res.data.message || 'Failed data.'); 
            }
        } catch (err) {
            console.error("Fetch Inactive err:", err);
            setError(err.response?.data?.message || 'Error loading data.');
            if (err.response?.status === 401) router.push('/admin/login');
        } finally { 
            setLoading(false); 
        }
    }, [router, selectedIds]);

    useEffect(() => {
        fetchData(1, '');
    }, [fetchData]);

    // --- Handlers ---
    const handleSearch = (query) => { 
        setSearchQuery(query); 
        setCurrentPage(1); 
        fetchData(1, query); 
    };

    const handlePageChange = (newPage) => { 
        fetchData(newPage, searchQuery); 
    };

    // --- NEW: Export Selected Only ---
    const handleExport = async () => {
        if (selectedIds.size === 0) {
            alert("Please select at least one user to export.");
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                router.push('/admin/login');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            const res = await axios.post(
                `${apiUrl}/api/admin/export/selected`,
                { 
                    registrationIds: Array.from(selectedIds),
                    listType: 'inactive', // helpful if your controller distinguishes lists
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'inactive_users_selected.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export selected inactive users failed:", err);
            alert("Export failed");
        }
    };

    // --- Selection Handlers ---
    const handleCheckboxChange = (id) => {
        setSelectedIds(prev => {
            const newIds = new Set(prev);
            if (newIds.has(id)) newIds.delete(id); else newIds.add(id);
            setRegistrations(regs => 
                regs.map(r => 
                    r.registrationId === id 
                        ? { ...r, isSelected: newIds.has(id) } 
                        : r
                )
            );
            return newIds;
        });
    };

    const handleSelectAll = () => {
        if (registrations.length === 0) return;

        if (selectedIds.size === registrations.length) {
            // Unselect all
            setSelectedIds(new Set());
            setRegistrations(regs => regs.map(r => ({ ...r, isSelected: false })));
        } else {
            // Select all
            const all = new Set(registrations.map(r => r.registrationId));
            setSelectedIds(all);
            setRegistrations(regs => regs.map(r => ({ ...r, isSelected: true })));
        }
    };

    // --- NEW: Bulk Restore ---
    const handleBulkRestore = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Restore ${selectedIds.size} users to active list?`)) return;

        setIsSubmitting(true);
        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            await axios.put(
                `${apiUrl}/api/admin/inactive-users/bulk-restore`, 
                { registrationIds: Array.from(selectedIds) }, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Users restored successfully!");
            setSelectedIds(new Set());
            fetchData(currentPage, searchQuery);
        } catch (err) {
            console.error(err);
            alert("Failed to restore users.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- NEW: Bulk Permanent Delete ---
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`⚠️ PERMANENTLY DELETE ${selectedIds.size} users? This cannot be undone.`)) return;

        setIsSubmitting(true);
        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            await axios.post(
                `${apiUrl}/api/admin/inactive-users/bulk-delete`, 
                { registrationIds: Array.from(selectedIds) }, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Users permanently deleted.");
            setSelectedIds(new Set());
            fetchData(currentPage, searchQuery);
        } catch (err) {
            console.error(err);
            alert("Failed to delete users.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Single Restore (Helper) ---
    const handleRestore = async (id) => {
        if (!confirm("Restore this user?")) return;
        try {
            const token = getToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            await axios.put(
                `${apiUrl}/api/admin/registrations/${id}/restore`, 
                {}, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("User restored!");
            fetchData(currentPage, searchQuery);
        } catch (err) { 
            console.error(err); 
            alert("Failed."); 
        }
    };

    return (
        <div className="max-w-7xl mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-red-700">Inactive Users (Recycle Bin)</h1>
                <div className="flex flex-wrap gap-2">
                    <Link 
                        href="/admin/dashboard" 
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600"
                    >
                        Back
                    </Link>
                    
                    {/* Export Selected Only */}
                    <button 
                        onClick={handleExport} 
                        disabled={loading || selectedIds.size === 0} 
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 disabled:bg-gray-400"
                    >
                        Export Selected
                    </button>

                    {/* --- Bulk Actions --- */}
                    <button 
                        onClick={handleBulkRestore} 
                        disabled={isSubmitting || selectedIds.size === 0} 
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Restore Selected
                    </button>
                    
                    <button 
                        onClick={handleBulkDelete} 
                        disabled={isSubmitting || selectedIds.size === 0} 
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                        Delete Permanently
                    </button>
                </div>
            </div>

            <div className="my-4">
                <Searchbar onSearch={handleSearch} isLoading={loading} />
            </div>

            {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3">
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll} 
                                    checked={registrations.length > 0 && selectedIds.size === registrations.length}
                                    className="h-4 w-4 text-blue-600"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        )}
                        
                        {!loading && registrations.map((reg) => (
                            <tr 
                                key={reg.registrationId} 
                                className={reg.isSelected ? "bg-blue-50" : "bg-red-50"}
                            >
                                <td className="p-3">
                                    <input 
                                        type="checkbox" 
                                        checked={Boolean(reg.isSelected)} 
                                        onChange={() => handleCheckboxChange(reg.registrationId)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{reg.fullName}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{reg.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{reg.mobile}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {new Date(reg.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    <button 
                                        onClick={() => handleRestore(reg.registrationId)} 
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        Restore
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!loading && registrations.length === 0 && !error && (
                    <p className="text-center text-gray-500 py-8">
                       {searchQuery ? `No results found for "${searchQuery}".` : 'No inactive users found.'}
                    </p>
                )}
            </div>

            {!loading && totalPages > 1 && ( 
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                    isLoading={loading}
                /> 
            )}
        </div>
    );
}
