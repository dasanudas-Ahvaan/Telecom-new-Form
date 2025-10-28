// client/app/admin/data-explorer/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link'; 

export default function DataExplorer() {
    const [availableFields, setAvailableFields] = useState([]);
    const [selectedField, setSelectedField] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false); // Combined loading state
    const [error, setError] = useState('');
    const router = useRouter();

    const getToken = () => localStorage.getItem('admin-token');

    // --- Fetch Available Fields on Load ---
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/admin/login');
            return;
        }

        const fetchFields = async () => {
            setLoading(true); // Start loading
            setError('');
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.get(`${apiUrl}/api/admin/form/fields`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data.success) {
                    setAvailableFields(res.data.fields);
                    if (res.data.fields.length > 0) {
                        const mobileField = res.data.fields.find(f => f.name === 'mobile');
                        setSelectedField(mobileField ? mobileField.name : res.data.fields[0].name);
                    } else {
                         setError('No form fields configured yet.'); // Inform user if fields are empty
                         setLoading(false); // Stop loading if no fields to fetch data for
                    }
                } else {
                    setError('Could not load available form fields.');
                     setLoading(false); // Stop loading on error
                }
            } catch (err) {
                console.error("Fetch fields error:", err);
                setError('Failed to fetch form fields.');
                 if (err.response?.status === 401) router.push('/admin/login');
                 setLoading(false); // Stop loading on error
            }
            // setLoading(false) will be handled by the next useEffect trigger or errors above
        };
        fetchFields();
    }, [router]);

    // --- Fetch Data When Field Changes ---
    useEffect(() => {
        if (!selectedField || availableFields.length === 0) {
            setLoading(false); // Ensure loading stops if no field selected
            return;
        }

        const fetchDataByField = async () => {
            setLoading(true); // Use the combined loading state
            setError('');
            setResults([]);
            const token = getToken();
            if (!token) {
                 setLoading(false);
                 router.push('/admin/login');
                 return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.get(`${apiUrl}/api/admin/data/by-field/${selectedField}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.data.success) {
                    setResults(res.data.data);
                    if (res.data.data.length === 0) {
                        setError(`No data found for field "${selectedField}".`); // Use setError for consistency
                    }
                } else {
                    setError(res.data.message);
                }
            } catch (err) {
                console.error("Fetch data error:", err);
                setError(err.response?.data?.message || 'Failed to fetch data.');
                if (err.response?.status === 401) router.push('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        fetchDataByField();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedField]); // Only trigger when selectedField changes

    // --- Handle Field Selection Change ---
    const handleFieldChange = (event) => {
        setSelectedField(event.target.value);
        setError(''); // Clear error when changing field
    };

    // --- Action Handlers ---
    const handleViewUser = (registrationId) => {
        router.push(`/admin/registrations/${registrationId}`);
    };

    const handleUpdateUser = (registrationId) => {
        router.push(`/admin/registrations/${registrationId}/edit`);
    };

    const handleDeleteUser = async (registrationId) => {
        if (confirm(`Are you sure you want to delete registration ${registrationId}? This cannot be undone.`)) {
            setLoading(true); // Reuse loading state
            setError('');
            const token = getToken();
            if (!token) { router.push('/admin/login'); return; }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.delete(`${apiUrl}/api/admin/registrations/${registrationId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.data.success) {
                    alert('Registration deleted successfully.');
                    setResults(prevResults => prevResults.filter(item => item.registrationId !== registrationId));
                    // Check if results are now empty after deletion
                    if (results.length === 1) {
                         setError(`No data found for field "${selectedField}".`); // Update message
                    }
                } else {
                    setError(res.data.message || 'Failed to delete registration.');
                }
            } catch (err) {
                console.error("Delete error:", err);
                setError(err.response?.data?.message || 'Error deleting registration.');
                 if (err.response?.status === 401) router.push('/admin/login');
            } finally {
                setLoading(false);
            }
        }
    };

    // Note: No top-level <main> tag here, as RootLayout provides it.
    return (
        // 1. Container div with max-w-6xl and styling
        <div className="min-h-screen bg-[url('/logos/background.jpg')] p-0 sm:p-8">
             {/* Ensure heading text is dark */}
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Data Explorer</h1>

            {/* --- Field Selection Section --- */}
            <div className="flex flex-wrap gap-4 items-center p-4 border rounded-lg mb-6 bg-gray-50">
                {/* Ensure label text is dark */}
                <label htmlFor="fieldSelect" className="block text-sm font-medium text-gray-700">
                    Select Field to View Data:
                </label>
                <select
                    id="fieldSelect"
                    value={selectedField}
                    onChange={handleFieldChange}
                    // Disable while loading fields OR loading data
                    disabled={loading || availableFields.length === 0}
                    // 2. Add text color and placeholder styling to select
                    className="mt-1 p-2 border border-gray-300 rounded-md flex-grow shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" // placeholder styling isn't standard for select, text color is key
                >
                    {/* Handle loading/empty states */}
                    {loading && availableFields.length === 0 && <option>Loading fields...</option>}
                    {!loading && availableFields.length === 0 && <option>No fields configured</option>}

                    {availableFields.map(field => (
                        <option key={field.name} value={field.name}>
                            {field.label} ({field.name})
                        </option>
                    ))}
                </select>
            </div>

            {/* Display Loading or Error Messages */}
            {loading && <p className="text-blue-600 my-4 text-center">Loading data...</p>}
            {error && <p className="text-red-600 my-4 text-center">{error}</p>}


            {/* --- Results Section --- */}
            {/* Show results only if not loading AND there are results AND no error message */}
            {!loading && results.length > 0 && !error && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        Showing {results.length} entries for field "{results[0]?.label || selectedField}"
                    </h3>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{results[0]?.label || selectedField}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((item) => (
                                    <tr key={item.registrationId}>
                                        {/* 3. Add text color classes to table data cells */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.mobile}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {Array.isArray(item.value)
                                               ? item.value.join(', ') // Render comma-separated for arrays
                                               : typeof item.value === 'object' && item.value !== null && item.value.label // Check if it's a {value, label} object
                                                ? item.value.label // Render only the label for objects
                                                 : (item.value !== null && item.value !== undefined ? String(item.value) : '') // Render string for others, or empty string for null/undefined
                                             }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handleViewUser(item.registrationId)} className="text-blue-600 hover:text-blue-900 hover:underline disabled:text-gray-400 disabled:no-underline" disabled={loading}>View</button>
                                            <button onClick={() => handleUpdateUser(item.registrationId)} className="text-indigo-600 hover:text-indigo-900 hover:underline disabled:text-gray-400 disabled:no-underline" disabled={loading}>Update</button>
                                            <button onClick={() => handleDeleteUser(item.registrationId)} className="text-red-600 hover:text-red-900 hover:underline disabled:text-gray-400 disabled:no-underline" disabled={loading}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* --- End Results Section --- */}

        </div>
    );
}