"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import Searchbar from "@/app/components/Searchbar";
import { DynamicField } from "@/app/components/DynamicField";

/* ===========================================================
 * HELPER: Direct Data Lookup
 * Finds data safely regardless of case (Age vs age) or structure
 * =========================================================== */
const getDynamicValue = (user, fieldName) => {
    if (!user || !Array.isArray(user.formData)) return "-";

    // 1. Find the item, ignoring case
    const item = user.formData.find(
        (f) => f.name?.toLowerCase() === fieldName?.toLowerCase()
    );

    if (!item || item.value === null || item.value === undefined) return "-";

    // 2. Handle React-Select Objects (e.g. Country: { label: "India", value: "IN" })
    if (typeof item.value === "object" && !Array.isArray(item.value)) {
        return item.value.label || item.value.value || "-";
    }

    // 3. Handle Multi-select Arrays
    if (Array.isArray(item.value)) {
        return item.value.join(", ");
    }

    return item.value;
};

export default function VerifiedUsersPage() {
    // --- STATE ---
    const [registrations, setRegistrations] = useState([]); // Source of truth for View Mode
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Action States
    const [isSubmittingInactive, setIsSubmittingInactive] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSavingEdits, setIsSavingEdits] = useState(false);

    const [schema, setSchema] = useState([]);

    // --- FORM SETUP ---
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: { users: [] },
    });

    // Initialize Field Array (Required for Edit Mode inputs to register correctly)
    useFieldArray({
        control,
        name: "users",
    });

    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const getToken = () => localStorage.getItem("admin-token");

    /* ===========================================================
     * 1. FETCH DATA & SCHEMA
     * =========================================================== */
    const fetchData = useCallback(
        async (query = "") => {
            setLoading(true);
            setError("");
            const token = getToken();
            if (!token) return router.push("/admin/login");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            try {
                // A. Fetch Schema (Dynamic Fields)
                let currentSchema = [];
                try {
                    const schemaRes = await axios.get(`${apiUrl}/api/admin/form`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (schemaRes.data.success) {
                        currentSchema = schemaRes.data.fields.filter(
                            (f) => f.name !== "email" && f.name !== "mobile"
                        );
                        setSchema(currentSchema);
                    }
                } catch (e) {
                    console.warn("Schema fetch warning:", e);
                }

                // B. Fetch Users (High limit for scrollable view - No Pagination)
                const res = await axios.get(`${apiUrl}/api/admin/verified-users`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page: 1, limit: 1000, search: query },
                });

                if (res.data.success) {
                    const fetchedData = res.data.registrations;

                    // 1. Set Raw Data (Visible in Table View Mode)
                    setRegistrations(fetchedData);

                    // 2. Prepare Form Data (Flatten dynamic fields for Edit Mode Inputs)
                    const formReadyData = fetchedData.map((user) => {
                        const flatFields = {};
                        if (Array.isArray(user.formData)) {
                            user.formData.forEach((f) => {
                                // Match schema name ignoring case
                                const schemaMatch = currentSchema.find(
                                    (s) => s.name.toLowerCase() === f.name.toLowerCase()
                                );
                                if (schemaMatch) {
                                    flatFields[schemaMatch.name] = f.value;
                                } else {
                                    flatFields[f.name] = f.value;
                                }
                            });
                        }
                        return { ...user, ...flatFields };
                    });

                    // Populate the hook form
                    reset({ users: formReadyData });

                    if (fetchedData.length === 0) {
                        setError(query ? `No results for "${query}".` : "No verified users found.");
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Error loading data.");
                if (err?.response?.status === 401) router.push("/admin/login");
            } finally {
                setLoading(false);
            }
        },
        [router, reset]
    );

    // Initial Load
    useEffect(() => {
        const t = setTimeout(() => fetchData(searchQuery), 500);
        return () => clearTimeout(t);
    }, [fetchData, searchQuery]);

    /* ===========================================================
     * 2. ACTION HANDLERS
     * =========================================================== */
    
    // Toggle Selection
    const handleCheckboxChange = (id) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    // Select/Deselect All loaded users
    const handleSelectAll = () => {
        if (registrations.length === 0) return;
        if (selectedIds.size === registrations.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(registrations.map((r) => r.registrationId)));
        }
    };

    // Export Logic
    const handleExport = async () => {
        if (selectedIds.size === 0) return alert("Please select users to export.");
        setLoading(true);
        try {
            const token = getToken();
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/export/selected`,
                { registrationIds: Array.from(selectedIds) },
                { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "verified_users_export.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert("Export failed. Check console.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Mark Inactive
    const handleMarkInactive = async () => {
        if (selectedIds.size === 0) return alert("Select users first.");
        if (!confirm(`Mark ${selectedIds.size} users as Inactive?`)) return;

        setIsSubmittingInactive(true);
        try {
            const token = getToken();
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/mark-inactive`,
                { registrationIds: Array.from(selectedIds) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Users marked inactive.");
            setSelectedIds(new Set());
            fetchData(searchQuery);
        } catch (err) {
            console.error(err);
            alert("Failed to mark inactive.");
        } finally {
            setIsSubmittingInactive(false);
        }
    };

    // Save Edits (Bulk Update)
    const onSaveAllChanges = async (data) => {
        const allUsers = data.users || [];
        const selectedUsersToUpdate = allUsers.filter((u) =>
            selectedIds.has(u.registrationId)
        );

        if (selectedUsersToUpdate.length === 0) return alert("No selected rows to save.");

        setIsSavingEdits(true);
        try {
            const token = getToken();
            
            // Transform form data back to API format
            const updates = selectedUsersToUpdate.map((user) => {
                const dynamicFormData = [];
                schema.forEach((field) => {
                    let val = user[field.name];

                    // Unwrap React Select objects if necessary
                    if (val && typeof val === "object" && "value" in val) {
                        val = val.value;
                    }
                    // Clean empty numbers
                    if (field.type === "Number" && (val === "" || val === null || isNaN(val))) {
                        val = null;
                    }

                    dynamicFormData.push({
                        name: field.name,
                        label: field.label,
                        value: val ?? null,
                    });
                });

                return {
                    registrationId: user.registrationId,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    formData: dynamicFormData,
                };
            });

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/registrations/bulk-update`,
                { updates },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Changes saved successfully!");
            setIsEditMode(false);
            setSelectedIds(new Set());
            fetchData(searchQuery);
        } catch (err) {
            console.error(err);
            alert("Error saving changes.");
        } finally {
            setIsSavingEdits(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        // Re-fetch to reset form state to original data
        fetchData(searchQuery);
    };

    const anyLoading = loading || isSavingEdits || isSubmittingInactive;

    /* ===========================================================
     * 3. RENDER UI
     * =========================================================== */
    return (
        <div className="max-w-[95%] mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-green-700">Verified Users</h1>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/dashboard"
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600"
                    >
                        Back to Dashboard
                    </Link>

                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={loading || selectedIds.size === 0}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        Export Selected ({selectedIds.size})
                    </button>

                    {!isEditMode ? (
                        <>
                            <button
                                type="button"
                                onClick={handleMarkInactive}
                                disabled={anyLoading || selectedIds.size === 0}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                            >
                                Mark Inactive
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsEditMode(true)}
                                disabled={anyLoading || selectedIds.size === 0}
                                className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-gray-400"
                            >
                                Edit Selected ({selectedIds.size})
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={anyLoading}
                                className="px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 disabled:bg-gray-300"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit(onSaveAllChanges)}
                                disabled={anyLoading}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                                Save Changes ({selectedIds.size})
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Search & Errors */}
            <div className="my-4">
                <Searchbar onSearch={setSearchQuery} isLoading={anyLoading} />
            </div>
            {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

            {/* Table Container */}
            <form onSubmit={handleSubmit(onSaveAllChanges)}>
                <div className="overflow-x-auto max-h-[75vh] overflow-y-auto border rounded mt-4 bg-white shadow-inner">
                    <table className="min-w-full divide-y divide-gray-200 relative border-collapse">
                        {/* Sticky Header */}
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-3 w-10 bg-gray-100">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={
                                            registrations.length > 0 &&
                                            selectedIds.size === registrations.length
                                        }
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 uppercase bg-gray-100 whitespace-nowrap">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 uppercase bg-gray-100 whitespace-nowrap">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 uppercase bg-gray-100 whitespace-nowrap">Mobile</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 uppercase bg-gray-100 whitespace-nowrap">Date</th>
                                
                                {schema.map((f) => (
                                    // FIXED CSS: whitespace-nowrap to prevent header explosion
                                    <th
                                        key={f.name}
                                        className="px-4 py-3 text-left text-sm font-bold text-gray-700 uppercase bg-gray-100 min-w-[200px] whitespace-nowrap"
                                        title={f.label}
                                    >
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan={schema.length + 5} className="text-center p-8">
                                        Loading Data...
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                registrations.map((user, index) => {
                                    const isSelected = selectedIds.has(user.registrationId);
                                    const editable = isEditMode && isSelected;

                                    return (
                                        <tr
                                            key={user.registrationId || index}
                                            className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                                        >
                                            {/* Checkbox */}
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        handleCheckboxChange(user.registrationId)
                                                    }
                                                />
                                            </td>

                                            {editable ? (
                                                /* ================= EDIT MODE ================= */
                                                <>
                                                    <td className="p-3">
                                                        <input
                                                            type="hidden"
                                                            {...register(`users.${index}.registrationId`)}
                                                        />
                                                        <input
                                                            className="w-full border rounded p-1"
                                                            {...register(`users.${index}.fullName`)}
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            className="w-full border rounded p-1"
                                                            {...register(`users.${index}.email`)}
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            className="w-full border rounded p-1"
                                                            {...register(`users.${index}.mobile`)}
                                                        />
                                                    </td>
                                                    <td className="p-3 text-sm text-gray-500">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>

                                                    {schema.map((field) => {
                                                        let depValue = null;
                                                        // Dependency Logic
                                                        const countryVal = watch(`users.${index}.country`);
                                                        if (field.type === "State") depValue = countryVal;
                                                        const stateVal = watch(`users.${index}.state`);
                                                        if (field.type === "City") {
                                                            depValue = {
                                                                countryCode: countryVal,
                                                                stateCode: stateVal,
                                                            };
                                                        }

                                                        return (
                                                            <td key={field.name} className="p-3 min-w-[200px]">
                                                                <DynamicField
                                                                    field={field}
                                                                    fieldName={`users.${index}.${field.name}`}
                                                                    control={control}
                                                                    register={register}
                                                                    setValue={setValue}
                                                                    error={errors.users?.[index]?.[field.name]}
                                                                    dependentValue={depValue}
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </>
                                            ) : (
                                                /* ================= VIEW MODE ================= */
                                                <>
                                                    <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
                                                        {user.fullName || "-"}
                                                    </td>
                                                    <td className="p-3 text-gray-600 whitespace-nowrap">
                                                        {user.email || "-"}
                                                    </td>
                                                    <td className="p-3 text-gray-600 whitespace-nowrap">
                                                        {user.mobile || "-"}
                                                    </td>
                                                    <td className="p-3 text-gray-600 whitespace-nowrap">
                                                        {user.createdAt
                                                            ? new Date(user.createdAt).toLocaleDateString()
                                                            : "-"}
                                                    </td>

                                                    {schema.map((field) => (
                                                        <td
                                                            key={field.name}
                                                            className="p-3 text-gray-600 min-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]"
                                                            title={getDynamicValue(user, field.name)}
                                                        >
                                                            {getDynamicValue(user, field.name)}
                                                        </td>
                                                    ))}
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
    );
}