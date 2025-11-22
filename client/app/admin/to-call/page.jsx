// client/app/admin/to-call/page.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useForm, useFieldArray } from 'react-hook-form';
import Searchbar from '@/app/components/Searchbar';
import Pagination from '@/app/components/Pagination';
import { DynamicField } from '@/app/components/DynamicField';
import countryList from 'react-select-country-list';

export default function ToCallPage() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingInactive, setIsSubmittingInactive] = useState(false);

    // Edit mode
    const [isEditMode, setIsEditMode] = useState(false);

    // Loading saver
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
     *                  UPDATED handleExport
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
            link.setAttribute('download', 'selected_users.csv');
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
     *                FETCH SCHEMA + REGISTRATIONS
     * =========================================================== */
    const fetchData = useCallback(async (page = 1, query = '') => {
        setLoading(true);
        setError('');
        const token = getToken();
        if (!token) { router.push('/admin/login'); return; }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            // Fetch schema
            let allFields = [];
            try {
                const schemaRes = await axios.get(`${apiUrl}/api/admin/form`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (schemaRes.data.success) {
                    allFields = schemaRes.data.fields.filter(f => f.name !== 'email' && f.name !== 'mobile');
                    setSchema(allFields);
                }
            } catch (schemaErr) {
                console.error("Schema error:", schemaErr);
            }

            const res = await axios.get(`${apiUrl}/api/admin/to-call`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit: 10, search: query }
            });

            if (res.data.success) {
                const countryOptions = countryList().getData();

                const fetched = res.data.registrations.map(reg => {
                    const dynamicData = {};
                    allFields.forEach(field => {
                        const savedField = Array.isArray(reg.formData) ? reg.formData.find(f => f.name === field.name) : undefined;
                        let fieldValue = savedField ? savedField.value : null;

                        if (field.type === 'Country' && fieldValue && typeof fieldValue === 'string') {
                            const found = countryOptions.find(c => c.value === fieldValue);
                            fieldValue = found || null;
                        }

                        dynamicData[field.name] = fieldValue;
                    });

                    return {
                        ...reg,
                        ...dynamicData,
                        isSelected: selectedIds.has(reg.registrationId)
                    };
                });

                setRegistrations(fetched);
                replace(fetched);

                setCurrentPage(res.data.pagination.page);
                setTotalPages(res.data.pagination.totalPages);

                if (res.data.registrations.length === 0) {
                    setError(query ? `No results for "${query}"` : "No users.");
                }
            }

        } catch (err) {
            console.error("Fetch error:", err);
            setError(err?.response?.data?.message || "Error loading data.");
            if (err?.response?.status === 401) router.push("/admin/login");
        } finally {
            setLoading(false);
        }

    }, [router, replace, selectedIds]);
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
                regs.map(r => r.registrationId === id ? { ...r, isSelected: newIds.has(id) } : r)
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
        if (selectedIds.size === 0) {
            setError("No users selected.");
            return;
        }
        if (!confirm(`Mark ${selectedIds.size} users inactive?`)) return;

        setIsSubmittingInactive(true);
        setError('');

        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            await axios.put(`${apiUrl}/api/admin/mark-inactive`,
                { registrationIds: Array.from(selectedIds) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Users marked inactive.");
            setSelectedIds(new Set());
            fetchData(currentPage, searchQuery);

        } catch (err) {
            setError("Error marking inactive.");
        } finally {
            setIsSubmittingInactive(false);
        }
    };


    /* ===========================================================
     *                SAVE ALL CHANGES (Selective Edit)
     * =========================================================== */
    const onSaveAllChanges = async (data) => {
        const allUsers = data.users || [];

        const selectedUsersToUpdate = allUsers.filter(u =>
            selectedIds.has(u.registrationId)
        );

        if (selectedUsersToUpdate.length === 0) {
            setError("No selected users to update.");
            setIsEditMode(false);
            return;
        }

        setIsSubmitting(true);
        setIsSavingEdits(true);
        setError('');

        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            const updates = selectedUsersToUpdate.map(user => {
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

            await axios.put(
                `${apiUrl}/api/admin/registrations/bulk-update`,
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
        }
        finally {
            setIsSubmitting(false);
            setIsSavingEdits(false);
        }
    };


    const handleCancelEdit = () => {
        setIsEditMode(false);
        reset({ users: registrations });
        setError('');
    };

    const anyLoading = loading || isSubmitting || isSubmittingInactive || isSavingEdits;


    /* ===========================================================
     *                RENDER
     * =========================================================== */
    return (
        <div className="max-w-[95%] mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-blue-800">Users to Call</h1>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/dashboard"
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600"
                    >
                        Back to Dashboard
                    </Link>

                    {/* UPDATED EXPORT BUTTON */}
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
                                Mark {selectedIds.size} Inactive
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit(onSaveAllChanges)}
                                disabled={anyLoading || selectedIds.size === 0}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Mark {selectedIds.size} Called
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

            {/* SEARCH */}
            <div className="my-4">
                <Searchbar onSearch={setSearchQuery} isLoading={anyLoading} />
            </div>

            {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

            {/* TABLE */}
            <form onSubmit={handleSubmit(onSaveAllChanges)}>
                <div className="overflow-x-auto">
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

                                <th className="px-4">Name</th>
                                <th className="px-4">Email</th>
                                <th className="px-4">Mobile</th>
                                <th className="px-4">Date</th>

                                {schema.map(field => (
                                    <th key={field.name} className="px-4">
                                        {field.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={schema.length + 5} className="text-center p-4">Loading...</td>
                                </tr>
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
                                                    <input className="w-full border p-1" {...register(`users.${index}.fullName`)} />
                                                </td>

                                                <td className="p-3">
                                                    <input className="w-full border p-1" {...register(`users.${index}.email`)} />
                                                </td>

                                                <td className="p-3">
                                                    <input className="w-full border p-1" {...register(`users.${index}.mobile`)} />
                                                </td>

                                                <td className="p-3 text-sm text-gray-700">
                                                    {new Date(registrations[index]?.createdAt).toLocaleDateString()}
                                                </td>

                                                {schema.map(field => (
                                                    <td key={field.name} className="p-3">
                                                        <DynamicField
                                                            field={field}
                                                            fieldName={`users.${index}.${field.name}`}
                                                            setValue={setValue}
                                                            control={control}
                                                            register={register}
                                                        />
                                                    </td>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-3">{user.fullName}</td>
                                                <td className="p-3">{user.email}</td>
                                                <td className="p-3">{user.mobile}</td>
                                                <td className="p-3">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>

                                                {schema.map(field => (
                                                    <td key={field.name} className="p-3">
                                                        {field.type === 'Country' && user[field.name]?.label
                                                            ? user[field.name].label
                                                            : Array.isArray(user[field.name])
                                                                ? user[field.name].join(', ')
                                                                : user[field.name] ?? '-'
                                                        }
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
