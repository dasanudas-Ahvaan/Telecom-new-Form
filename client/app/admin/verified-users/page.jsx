// client/app/admin/verified-users/page.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useForm, useFieldArray } from 'react-hook-form';
import Searchbar from '@/app/components/Searchbar';
import Pagination from '@/app/components/Pagination';
import { DynamicField } from '@/app/components/DynamicField';
import countryList from 'react-select-country-list';

export default function VerifiedUsersPage() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isSubmittingInactive, setIsSubmittingInactive] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSavingEdits, setIsSavingEdits] = useState(false);

    const [schema, setSchema] = useState([]);

    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: { users: [] }
    });

    const { fields: userFields, replace } = useFieldArray({
        control,
        name: "users"
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();
    const getToken = () => localStorage.getItem('admin-token');

    /* ===========================================================
     *                UPDATED handleExport (same as To Call)
     * =========================================================== */
    const handleExport = async () => {
        if (selectedIds.size === 0) {
            setError("Please select at least one user to export.");
            return;
        }

        setLoading(true);
        setError('');
        const token = getToken();
        if (!token) return router.push('/admin/login');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.post(
                `${apiUrl}/api/admin/export/selected`,
                { registrationIds: Array.from(selectedIds) },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'verified_users.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Export error:", err);
            setError(err.response?.data?.message || 'Failed to download report.');
        } finally {
            setLoading(false);
        }
    };

    /* ===========================================================
     *                FETCH SCHEMA + VERIFIED USERS
     * =========================================================== */
    const fetchData = useCallback(async (page = 1, query = '') => {
        setLoading(true);
        setError('');
        const token = getToken();
        if (!token) { router.push('/admin/login'); return; }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            let allFields = [];
            try {
                const schemaRes = await axios.get(`${apiUrl}/api/admin/form`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (schemaRes.data.success) {
                    allFields = schemaRes.data.fields.filter(f => f.name !== 'email' && f.name !== 'mobile');
                    setSchema(allFields);
                }
            } catch (err) {
                console.error("Schema error:", err);
            }

            const res = await axios.get(`${apiUrl}/api/admin/verified-users`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit: 10, search: query }
            });

            if (res.data.success) {
                const selected = new Set(selectedIds);
                const countryOptions = countryList().getData();

                const fetched = res.data.registrations.map(reg => {
                    const dynamicData = {};
                    allFields.forEach(field => {
                        const saved = Array.isArray(reg.formData) ? reg.formData.find(f => f.name === field.name) : undefined;
                        let value = saved ? saved.value : null;

                        if (field.type === 'Country' && typeof value === 'string') {
                            const matched = countryOptions.find(c => c.value === value);
                            value = matched || null;
                        }

                        dynamicData[field.name] = value;
                    });

                    return {
                        ...reg,
                        ...dynamicData,
                        isSelected: selected.has(reg.registrationId)
                    };
                });

                setRegistrations(fetched);
                replace(fetched);

                setCurrentPage(res.data.pagination.page);
                setTotalPages(res.data.pagination.totalPages);

                if (fetched.length === 0) {
                    setError(query ? `No results for "${query}".` : "No verified users.");
                }
            }

        } catch (err) {
            console.error("Fetch verified error:", err);
            setError(err?.response?.data?.message || "Error loading data.");
            if (err?.response?.status === 401) router.push("/admin/login");
        } finally {
            setLoading(false);
        }

    }, [replace, selectedIds, router]);

// Replace your current useEffect with this:

useEffect(() => {
    // 1. Set a timer to run the fetch after 500 milliseconds
    const timer = setTimeout(() => {
        fetchData(1, searchQuery);
    }, 500);

    // 2. Cleanup function: If the user types again before 500ms, 
    // this cancels the previous timer and starts a new one.
    return () => clearTimeout(timer);

}, [fetchData, searchQuery]);


    /* ===========================================================
     *                SELECTION HANDLERS
     * =========================================================== */
    const handleCheckboxChange = (id) => {
        setSelectedIds(prev => {
            const newIds = new Set(prev);

            if (newIds.has(id)) newIds.delete(id);
            else newIds.add(id);

            setRegistrations(regs =>
                regs.map(r =>
                    r.registrationId === id ? { ...r, isSelected: newIds.has(id) } : r
                )
            );

            return newIds;
        });
    };

    const handleSelectAll = () => {
        if (registrations.length === 0) return;

        if (selectedIds.size === registrations.length) {
            setSelectedIds(new Set());
            setRegistrations(regs => regs.map(r => ({ ...r, isSelected: false })));
        } else {
            const all = new Set(registrations.map(r => r.registrationId));
            setSelectedIds(all);
            setRegistrations(regs => regs.map(r => ({ ...r, isSelected: true })));
        }
    };


    /* ===========================================================
     *                MARK INACTIVE
     * =========================================================== */
    const handleMarkInactive = async () => {
        if (selectedIds.size === 0) return alert("No users selected.");
        if (!confirm(`Mark ${selectedIds.size} users inactive?`)) return;

        setIsSubmittingInactive(true);

        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            await axios.put(`${apiUrl}/api/admin/mark-inactive`, {
                registrationIds: Array.from(selectedIds)
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert("Users marked inactive.");
            setSelectedIds(new Set());
            fetchData(currentPage, searchQuery);

        } catch (err) {
            console.error(err);
            setError("Error marking inactive.");
        } finally {
            setIsSubmittingInactive(false);
        }
    };


    /* ===========================================================
     *                SAVE ONLY SELECTED ROWS
     * =========================================================== */
    const onSaveAllChanges = async (data) => {
        const allUsers = data.users || [];
        const selectedUsers = allUsers.filter(u =>
            selectedIds.has(u.registrationId)
        );

        if (selectedUsers.length === 0) {
            setError("No selected rows to save.");
            setIsEditMode(false);
            return;
        }

        setIsSavingEdits(true);

        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            const updates = selectedUsers.map(user => {
                const dynamicFormData = [];

                schema.forEach(field => {
                    let val = user[field.name];
                    if (field.type === 'Country' && val?.value) val = val.value;
                    if (field.type === 'Number' && isNaN(val)) val = null;

                    dynamicFormData.push({
                        name: field.name,
                        label: field.label,
                        value: val ?? null
                    });
                });

                return {
                    registrationId: user.registrationId,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    formData: dynamicFormData
                };
            });

            await axios.put(`${apiUrl}/api/admin/registrations/bulk-update`,
                { updates },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Changes saved.");
            setIsEditMode(false);
            setSelectedIds(new Set());
            fetchData(currentPage, searchQuery);

        } catch (err) {
            console.error(err);
            setError("Error saving changes.");
        } finally {
            setIsSavingEdits(false);
        }
    };


    const handleCancelEdit = () => {
        setIsEditMode(false);
        reset({ users: registrations });
    };


    const anyLoading = loading || isSavingEdits || isSubmittingInactive;



    /* ===========================================================
     *                UI RENDER
     * =========================================================== */
    return (
        <div className="max-w-[95%] mx-auto p-6 bg-white rounded-lg shadow text-gray-900 mt-8">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold text-green-700">Verified Users</h1>

                <div className="flex flex-wrap gap-2">

                    <Link href="/admin/dashboard"
                        className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600">
                        Back to Dashboard
                    </Link>

                    {/* NEW EXPORT SELECTED BUTTON */}
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={loading || selectedIds.size === 0}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        Export Selected ({selectedIds.size})
                    </button>

                    {/* Mark Inactive */}
                    <button
                        type="button"
                        onClick={handleMarkInactive}
                        disabled={anyLoading || selectedIds.size === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded shadow disabled:bg-gray-400"
                    >
                        Mark {selectedIds.size} Inactive
                    </button>

                    {!isEditMode ? (
                        <button
                            type="button"
                            onClick={() => setIsEditMode(true)}
                            disabled={anyLoading || selectedIds.size === 0}
                            className="px-4 py-2 bg-yellow-500 text-white rounded shadow disabled:bg-gray-400"
                        >
                            Edit Selected ({selectedIds.size})
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={anyLoading}
                                className="px-4 py-2 bg-gray-400 text-white rounded shadow disabled:bg-gray-300"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit(onSaveAllChanges)}
                                disabled={anyLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded shadow disabled:bg-gray-300"
                            >
                                Save Changes ({selectedIds.size})
                            </button>
                        </>
                    )}

                </div>
            </div>

            {/* SEARCH */}
            <Searchbar onSearch={setSearchQuery} isLoading={anyLoading} />

            {error && <p className="text-red-600 text-center my-3">{error}</p>}

            {/* TABLE */}
            <form onSubmit={handleSubmit(onSaveAllChanges)}>
                <div className="overflow-x-auto mt-4">

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={registrations.length > 0 && selectedIds.size === registrations.length}
                                    />
                                </th>

                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Mobile</th>
                                <th className="px-4 py-2">Date</th>

                                {schema.map(field => (
                                    <th key={field.name} className="px-4 py-2">{field.label}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr><td colSpan={schema.length + 5} className="text-center p-4">Loading...</td></tr>
                            )}

                            {!loading && userFields.map((user, index) => {
                                const rowSelected = registrations[index]?.isSelected;
                                const editable = isEditMode && rowSelected;

                                return (
                                    <tr key={user.id} className={rowSelected ? "bg-blue-50" : ""}>

                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={rowSelected}
                                                onChange={() => handleCheckboxChange(registrations[index].registrationId)}
                                            />
                                        </td>

                                        {editable ? (
                                            <>
                                                <td className="p-3">
                                                    <input type="hidden" {...register(`users.${index}.registrationId`)} />
                                                    <input className="w-full border p-1"
                                                        {...register(`users.${index}.fullName`)} />
                                                </td>

                                                <td className="p-3">
                                                    <input className="w-full border p-1"
                                                        {...register(`users.${index}.email`)} />
                                                </td>

                                                <td className="p-3">
                                                    <input className="w-full border p-1"
                                                        {...register(`users.${index}.mobile`)} />
                                                </td>

                                                <td className="p-3">
                                                    {new Date(registrations[index]?.createdAt).toLocaleDateString()}
                                                </td>

                                                {schema.map(field => (
                                                    <td key={field.name} className="p-3">
                                                        <DynamicField
                                                            field={field}
                                                            fieldName={`users.${index}.${field.name}`}
                                                            control={control}
                                                            register={register}
                                                            error={errors.users?.[index]?.[field.name]}
                                                            setValue={setValue}
                                                        />
                                                    </td>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-3">{user.fullName}</td>
                                                <td className="p-3">{user.email}</td>
                                                <td className="p-3">{user.mobile}</td>
                                                <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>

                                                {schema.map(field => (
                                                    <td key={field.name} className="p-3">
                                                        {field.type === 'Country' && user[field.name]?.label
                                                            ? user[field.name].label
                                                            : Array.isArray(user[field.name])
                                                                ? user[field.name].join(', ')
                                                                : user[field.name] ?? '-'}
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

            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => fetchData(p, searchQuery)}
                />
            )}

        </div>
    );
}
