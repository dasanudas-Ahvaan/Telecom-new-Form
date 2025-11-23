// client/app/admin/inactive-users/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Searchbar from "@/app/components/Searchbar";
import Pagination from "@/app/components/Pagination";

export default function InactiveUsersPage() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Selection state
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();
    const getToken = () => localStorage.getItem("admin-token");

    /* ===========================================================
     *           FETCH DATA (stable – no jump / no reset)
     * =========================================================== */
    const fetchData = useCallback(
        async (page = 1, query = "") => {
            setLoading(true);
            setError("");

            const token = getToken();
            if (!token) {
                router.push("/admin/login");
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                const res = await axios.get(`${apiUrl}/api/admin/inactive-users`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page, limit: 10, search: query },
                });

                if (res.data.success) {
                    const fetched = res.data.registrations.map((reg) => ({
                        ...reg,
                        isSelected: selectedIds.has(reg.registrationId),
                    }));

                    setRegistrations(fetched);
                    setCurrentPage(res.data.pagination.page);
                    setTotalPages(res.data.pagination.totalPages);

                    if (fetched.length === 0) {
                        setError(
                            query ? `No results for "${query}".` : "No inactive users found."
                        );
                    }
                }
            } catch (err) {
                console.error("Fetch Inactive err:", err);
                setError(err.response?.data?.message || "Error loading data.");
                if (err.response?.status === 401) router.push("/admin/login");
            } finally {
                setLoading(false);
            }
        },
        [router] // ❗ removed selectedIds so selecting users does NOT refetch
    );

    /* ===========================================================
     *         Debounced Search – prevents jumps & flicker
     * =========================================================== */
    useEffect(() => {
        const t = setTimeout(() => {
            fetchData(1, searchQuery);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(t);
    }, [fetchData, searchQuery]);

    /* ===========================================================
     *                    Pagination handler
     * =========================================================== */
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchData(page, searchQuery);
    };

    /* ===========================================================
     *                   Selection Handlers
     * =========================================================== */
    const handleCheckboxChange = (id) => {
        setSelectedIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) updated.delete(id);
            else updated.add(id);

            // update UI without refetch
            setRegistrations((prevRegs) =>
                prevRegs.map((r) =>
                    r.registrationId === id
                        ? { ...r, isSelected: updated.has(id) }
                        : r
                )
            );

            return updated;
        });
    };

    const handleSelectAll = () => {
        if (registrations.length === 0) return;

        if (selectedIds.size === registrations.length) {
            setSelectedIds(new Set());
            setRegistrations((regs) => regs.map((r) => ({ ...r, isSelected: false })));
        } else {
            const all = new Set(registrations.map((r) => r.registrationId));
            setSelectedIds(all);
            setRegistrations((regs) => regs.map((r) => ({ ...r, isSelected: true })));
        }
    };

    /* ===========================================================
     *                Export Selected Only
     * =========================================================== */
    const handleExport = async () => {
        if (selectedIds.size === 0) return alert("Select at least one user.");

        try {
            const token = getToken();
            if (!token) return router.push("/admin/login");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            const res = await axios.post(
                `${apiUrl}/api/admin/export/selected`,
                {
                    registrationIds: Array.from(selectedIds),
                    listType: "inactive",
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "inactive_users_selected.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export error:", err);
            alert("Export failed");
        }
    };

    /* ===========================================================
     *                Bulk Restore
     * =========================================================== */
    const handleBulkRestore = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Restore ${selectedIds.size} users?`)) return;

        setIsSubmitting(true);
        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            await axios.put(
                `${apiUrl}/api/admin/inactive-users/bulk-restore`,
                { registrationIds: Array.from(selectedIds) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Users restored successfully!");
            setSelectedIds(new Set());
            fetchData(currentPage, searchQuery);
        } catch (err) {
            console.error(err);
            alert("Restore failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ===========================================================
     *                Permanent Delete
     * =========================================================== */
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`⚠ Delete ${selectedIds.size} users permanently?`)) return;

        setIsSubmitting(true);
        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            await axios.post(
                `${apiUrl}/api/admin/inactive-users/bulk-delete`,
                { registrationIds: Array.from(selectedIds) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Users permanently deleted.");
            setSelectedIds(new Set());
            fetchData(currentPage, searchQuery);
        } catch (err) {
            console.error(err);
            alert("Delete failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ===========================================================
     *                Single Restore
     * =========================================================== */
    const handleRestore = async (id) => {
        if (!confirm("Restore this user?")) return;

        try {
            const token = getToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            await axios.put(
                `${apiUrl}/api/admin/registrations/${id}/restore`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("User restored!");
            fetchData(currentPage, searchQuery);
        } catch (err) {
            console.error(err);
            alert("Restore failed.");
        }
    };

    const anyLoading = loading || isSubmitting;

    return (
        <div className="max-w-7xl mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-red-700">Inactive Users (Recycle Bin)</h1>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/dashboard"
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600"
                    >
                        Back
                    </Link>

                    <button
                        onClick={handleExport}
                        disabled={loading || selectedIds.size === 0}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-sm disabled:bg-gray-300"
                    >
                        Export Selected
                    </button>

                    <button
                        onClick={handleBulkRestore}
                        disabled={anyLoading || selectedIds.size === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm disabled:bg-gray-300"
                    >
                        Restore Selected
                    </button>

                    <button
                        onClick={handleBulkDelete}
                        disabled={anyLoading || selectedIds.size === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm disabled:bg-gray-300"
                    >
                        Delete Permanently
                    </button>
                </div>
            </div>

            {/* SEARCH */}
            <div className="my-4">
                <Searchbar onSearch={setSearchQuery} isLoading={loading} />
            </div>

            {error && (
                <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={
                                        registrations.length > 0 &&
                                        selectedIds.size === registrations.length
                                    }
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Mobile
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            registrations.map((reg) => (
                                <tr
                                    key={reg.registrationId}
                                    className={
                                        reg.isSelected ? "bg-blue-50" : "bg-red-50"
                                    }
                                >
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={reg.isSelected}
                                            onChange={() =>
                                                handleCheckboxChange(reg.registrationId)
                                            }
                                        />
                                    </td>

                                    <td className="px-6 py-4">{reg.fullName}</td>
                                    <td className="px-6 py-4">{reg.email}</td>
                                    <td className="px-6 py-4">{reg.mobile}</td>
                                    <td className="px-6 py-4">
                                        {new Date(reg.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            className="text-blue-600 hover:underline"
                                            onClick={() => handleRestore(reg.registrationId)}
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
                        {searchQuery
                            ? `No results found for "${searchQuery}".`
                            : "No inactive users found."}
                    </p>
                )}
            </div>

            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
