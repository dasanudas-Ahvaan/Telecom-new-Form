// This file corresponds to FormEditor.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link"; // Import Link for Back button

// All the field types your admin can choose from
const fieldTypes = [
    "Text", "Email", "Number", "Date", "Phone", "Country", "Radio", "Checkbox"
];

export default function FormEditor() {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("admin-token") : null);

    // --- Fetch current form schema ---
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/admin/login");
            return;
        }
        const fetchForm = async () => {
            setLoading(true);
            setError(''); // Clear error on fetch start
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.get(`${apiUrl}/api/admin/form`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Use the modified controller logic which returns [] on empty
                if (res.data?.success && Array.isArray(res.data.fields)) {
                     // Set default fields only if the fetched array is truly empty
                    if (res.data.fields.length === 0) {
                        setFields([
                            { name: "firstName", label: "First Name", type: "Text", required: true, options: [] },
                            { name: "lastName", label: "Last Name", type: "Text", required: true, options: [] },
                            { name: "email", label: "Email", type: "Email", required: true, options: [] },
                            { name: "mobile", label: "Mobile", type: "Phone", required: true, options: [] },
                        ]);
                    } else {
                         setFields(res.data.fields);
                    }
                } else {
                    // Handle case where success is false or fields is not an array
                    setError(res.data?.message || 'Could not load form configuration.');
                     setFields([ // Fallback default fields on error
                        { name: "firstName", label: "First Name", type: "Text", required: true, options: [] },
                        { name: "lastName", label: "Last Name", type: "Text", required: true, options: [] },
                     ]);
                }
            } catch (err) {
                console.error("Fetch form error:", err);
                setError(err.response?.data?.message || "Failed to load form.");
                 if (err.response?.status === 401) router.push('/admin/login');
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [router]);

    // --- Field Management Functions ---
    const handleFieldChange = (index, event) => {
        const newFields = [...fields];
        const { name, value, type, checked } = event.target;
        newFields[index] = {
            ...newFields[index],
            [name]: type === "checkbox" ? checked : value,
        };
        if (name === "type" && !["Radio", "Checkbox"].includes(value)) {
            newFields[index].options = [];
        }
        setFields(newFields);
    };

    const addField = () => {
        // Ensure unique default name
        const newFieldName = `newField${Date.now()}`;
        setFields([
            ...fields,
            { name: newFieldName, label: "New Field", type: "Text", required: false, options: [] },
        ]);
    };

    const removeField = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    // --- Option Management Functions ---
    const addOption = (fieldIndex) => {
        const newFields = [...fields];
        if (!Array.isArray(newFields[fieldIndex].options)) {
            newFields[fieldIndex].options = [];
        }
        newFields[fieldIndex].options.push("New Option");
        setFields(newFields);
    };

    const handleOptionChange = (fieldIndex, optIndex, value) => {
        const newFields = [...fields];
        if (!Array.isArray(newFields[fieldIndex].options)) newFields[fieldIndex].options = [];
        newFields[fieldIndex].options[optIndex] = value;
        setFields(newFields);
    };

    const removeOption = (fieldIndex, optIndex) => {
        const newFields = [...fields];
        if (!Array.isArray(newFields[fieldIndex].options)) return;
        newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_, i) => i !== optIndex);
        setFields(newFields);
    };

    // --- Save Function ---
    const handleSave = async () => {
        const token = getToken();
        if (!token) return router.push("/admin/login");
        setLoading(true); // Use combined loading state
        setError("");
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.put(
                `${apiUrl}/api/admin/form/update`,
                { fields }, // Send current fields state
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data?.success) {
                alert("Form updated successfully!");
                // Optionally refetch fields if backend modifies them on save
                 setFields(res.data.fields || fields);
            } else {
                setError(res.data?.message || "Failed to update form.");
            }
        } catch (err) {
            console.error("Save form error:", err);
            setError(err.response?.data?.message || "An error occurred.");
             if (err.response?.status === 401) router.push('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    // --- Loading State ---
    if (loading && fields.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                 {/* Ensure loading text is dark */}
                <p className="text-gray-900">Loading Form Editor...</p>
            </main>
        );
    }

    // --- Main Return ---
    return (
        // 1. Container div with max-w-4xl and styling, added default text color
        <div className="min-h-screen bg-[url('/logos/background.jpg')] p-0 sm:p-8">
             <div className="flex justify-between items-center mb-6">
                {/* Ensure heading text is dark */}
                <h1 className="text-3xl font-bold text-blue-800">Form Editor</h1>
                 <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
             </div>
             {/* Ensure paragraph text is dark */}
            <p className="mb-6 text-gray-700">Add, remove, or edit the fields for the user registration form.</p>
            {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

            {/* --- Form Fields List --- */}
            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                        {/* --- Main Field Config --- */}
                        <div className="flex flex-wrap items-center gap-4">
                            <input
                                type="text" name="label" value={field.label || ''} // Handle potential undefined value
                                onChange={(e) => handleFieldChange(index, e)}
                                placeholder="Field Label"
                                // 2. Added text/placeholder classes
                                className="flex-grow p-2 border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                                type="text" name="name" value={field.name || ''} // Handle potential undefined value
                                onChange={(e) => handleFieldChange(index, e)}
                                placeholder="Field Name (e.g. firstName)"
                                // 2. Added text/placeholder classes
                                className="flex-grow p-2 border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <select
                                name="type" value={field.type || 'Text'} // Handle potential undefined value, default to 'Text'
                                onChange={(e) => handleFieldChange(index, e)}
                                // 2. Added text color class
                                className="p-2 border border-gray-300 rounded text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {fieldTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                             {/* Ensure label text is dark */}
                            <label className="flex items-center gap-2 text-gray-700">
                                <input
                                    type="checkbox" name="required"
                                    checked={Boolean(field.required)}
                                    onChange={(e) => handleFieldChange(index, e)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                Required
                            </label>
                            <button
                                onClick={() => removeField(index)}
                                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            > Remove </button>
                        </div>

                        {/* --- Options Config (Only for Radio/Checkbox) --- */}
                        {["Radio", "Checkbox"].includes(field.type) && (
                            <div className="pl-6 border-l-4 border-blue-300 space-y-2">
                                 {/* Ensure heading text is dark */}
                                <h4 className="text-sm font-semibold text-gray-700">Options for {field.label || 'this field'}</h4>
                                {(field.options || []).map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                        <input
                                            type="text" value={opt || ''} // Handle potential undefined value
                                            onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                            // 2. Added text/placeholder classes
                                            className="flex-grow p-1 border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={`Option ${optIndex + 1}`}
                                        />
                                        <button onClick={() => removeOption(index, optIndex)} className="text-red-500 hover:text-red-700 font-bold text-lg">
                                            &times; {/* Use HTML entity for X */}
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addOption(index)}
                                    className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                > + Add Option </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

             {/* --- Action Buttons --- */}
            <div className="mt-8 pt-6 border-t flex justify-between">
                <button
                    onClick={addField}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                > Add Field </button>
                <button
                    onClick={handleSave}
                    disabled={loading} // Use combined loading state
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
                > {loading ? "Saving..." : "Save Changes"} </button>
            </div>
        </div>
        // Removed outer <main> tag as RootLayout provides it
    );
}