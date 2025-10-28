// client/app/admin/registrations/[id]/edit/page.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';

// --- Import Form Field Components ---
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';

// --- Re-usable Dynamic Field Component (with styling fixes) ---
const DynamicField = ({ field, control, register, error }) => {
    const { name, label, type, required, options } = field;
    const isReadOnly = name === 'email'; // Keep email read-only

    // Skip rendering mobile field completely
    if (name === 'mobile') {
        return null;
    }

    // 2. Base classes for inputs/selects including text/placeholder colors
    const baseInputClasses = `mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400`;
    const readOnlyClasses = isReadOnly ? 'bg-gray-100 cursor-not-allowed' : '';

    // Separate register from base props for simple inputs
    const commonBaseProps = {
        id: name,
        className: `${baseInputClasses} ${readOnlyClasses}`,
        readOnly: isReadOnly,
    };

    const renderField = () => {
        switch (type) {
            // Apply register directly to simple inputs
            case 'Text':
                return <input type="text" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
            case 'Email':
                return <input type="email" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
            case 'Number':
                return <input type="number" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
            case 'Date':
                return <input type="date" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
            case 'Phone': return null;
            case 'Country':
                const countryOptions = useMemo(() => countryList().getData(), []);
                return (
                    <Controller name={name} control={control} rules={{ required: required && `${label} is required` }}
                        render={({ field: controllerField }) => (
                            // Apply styling fixes to react-select
                            <Select
                                {...controllerField}
                                options={countryOptions}
                                className="mt-1 text-gray-900" // Base text color
                                classNamePrefix="react-select" // react-select uses prefixes for internal elements
                                isDisabled={isReadOnly}
                                placeholder={`Select ${label}...`}
                                styles={{ // Explicit styles for visibility
                                    placeholder: (baseStyles) => ({ ...baseStyles, color: '#9ca3af' }), // gray-400
                                    input: (baseStyles) => ({ ...baseStyles, color: '#111827' }),       // gray-900
                                    singleValue: (baseStyles) => ({ ...baseStyles, color: '#111827' }), // gray-900 for selected
                                    control: (baseStyles) => ({ // Ensure border color matches other inputs
                                     ...baseStyles,
                                     borderColor: '#d1d5db', // gray-300
                                     boxShadow: 'none', // Remove default focus shadow if needed
                                     '&:hover': { borderColor: '#9ca3af' }, 
                                     }),
                                }}
                            />
                        )}
                    />
                );
            case 'Radio':
                return (
                     // Ensure label text for options is dark
                    <div className="mt-2 space-y-1 text-gray-900">
                        {(options || []).map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                                <input type="radio" value={opt} {...register(name, { required: required && `${label} is required` })}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" disabled={isReadOnly} /> {opt}
                            </label>
                        ))}
                    </div>
                );
            case 'Checkbox':
                 return (
                     // Ensure label text for options is dark
                    <div className="mt-2 space-y-1 text-gray-900">
                        {(options || []).map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                                <input type="checkbox" value={opt} {...register(name)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" disabled={isReadOnly} /> {opt}
                            </label>
                        ))}
                    </div>
                );
            default: // Fallback to text input
                 return <input type="text" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
        }
    };

     if (!renderField()) return null;

    return (
        <div className={`sm:col-span-1 ${type === 'Checkbox' || type === 'Radio' ? 'sm:col-span-2' : ''}`}>
             {/* Ensure label text is dark */}
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label} {required && '*'}</label>
            {renderField()}
             {/* Safely display error message */}
            {error && error.message && typeof error.message === 'string' && (
               <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
        </div>
    );
};
// --- End Dynamic Field ---


export default function EditRegistrationPage() {
    const params = useParams();
    const router = useRouter();
    const registrationId = params.id;

    const [currentSchema, setCurrentSchema] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm();

    const getToken = () => localStorage.getItem('admin-token');

    // --- Fetch Schema and User Data ---
    useEffect(() => {
     
         if (!registrationId) return;
        const token = getToken();
        if (!token) { router.push('/admin/login'); return; }

        const fetchData = async () => {
            setLoading(true); setError('');
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const [schemaRes, userRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/admin/form`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${apiUrl}/api/admin/registrations/${registrationId}`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                if (!schemaRes.data.success || !userRes.data.success) throw new Error('Failed data.');

                const schemaFields = schemaRes.data.fields || [];
                const userData = userRes.data.registration;
                setCurrentSchema(schemaFields.filter(field => field.name !== 'mobile'));

                const defaultValues = {};
                defaultValues.firstName = userData.firstName || '';
                defaultValues.lastName = userData.lastName || '';
                defaultValues.email = userData.email || '';

                const countryOptions = countryList().getData();

                if (userData.formData) {
                    userData.formData.forEach(savedField => {
                         if (schemaFields.some(sf => sf.name === savedField.name) && savedField.name !== 'mobile') {
                            if (schemaFields.find(sf => sf.name === savedField.name)?.type === 'Country') {
                                const countryObject = countryOptions.find(opt => opt.value === savedField.value);
                                defaultValues[savedField.name] = countryObject || null;
                            } else { defaultValues[savedField.name] = savedField.value; }
                        }
                    });
                }
                console.log("Setting defaultValues (excluding mobile):", defaultValues);
                setTimeout(() => { reset(defaultValues); }, 0);
            } catch (err) {
                console.error("Fetch err:", err); setError(err.response?.data?.message || 'Error loading.');
                 if (err.response?.status === 401) router.push('/admin/login');
            } finally { setLoading(false); }
        };
        fetchData();
    }, [registrationId, router, reset]);

    // --- Handle Form Submission ---
    const onSubmit = async (data) => {
      
         setIsSubmitting(true); setError('');
        const token = getToken(); if (!token) return router.push('/admin/login');

        const formDataArray = currentSchema
            .filter(field => !['firstName', 'lastName', 'email'].includes(field.name))
            .map(field => {
                let valueToSave = data[field.name];
                if (field.type === 'Country' && valueToSave && typeof valueToSave === 'object' && valueToSave.hasOwnProperty('value')) {
                    valueToSave = valueToSave.value;
                } else if (valueToSave === undefined || valueToSave === null) { valueToSave = null; }
                return { name: field.name, label: field.label, value: valueToSave };
            });

        const updatePayload = {
            firstName: data.firstName || '', lastName: data.lastName || '',
            email: data.email || '', formData: formDataArray,
        };
        console.log("Submitting Payload:", updatePayload);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.put(`${apiUrl}/api/admin/registrations/${registrationId}`, updatePayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) { alert('Updated!'); router.push(`/admin/registrations/${registrationId}`); }
            else { setError(res.data.message || 'Failed.'); }
        } catch (err) { console.error("Update err:", err); setError(err.response?.data?.message || 'Error.'); }
        finally { setIsSubmitting(false); }
    };

    // --- Loading and Error States ---
    if (loading) { return <main className="flex min-h-screen items-center justify-center"><p className="text-gray-900">Loading Edit Form...</p></main>; } // Ensure loading text is dark
    if (error && !loading) {
        return (
            <main className="flex min-h-screen items-center justify-center p-8">
                 {/* 1. Wrap error content */}
                <div className="max-w-md mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
                </div>
            </main>
        );
    }

    // --- Main Return ---
    return (
        // 1. Wrap main form content in the styled container div (using max-w-4xl)
        // Added text-gray-900 for default dark text
        <div className="max-w-4xl mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                    {/* Ensure heading text is dark */}
                    <h1 className="text-3xl font-bold text-blue-800">Edit Registration</h1>
                    <Link href={`/admin/registrations/${registrationId}`} className="text-blue-600 hover:underline">Back to Details</Link>
                </div>

                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {/* Ensure legend text is dark */}
                    <legend className="text-lg font-medium text-gray-900 mb-4 col-span-1 sm:col-span-2">
                        User Details (Reg ID: {registrationId})
                    </legend>

                    {/* Render fields based on filtered schema (excludes mobile) */}
                    {currentSchema.map(field => (
                        <DynamicField
                            key={field.name}
                            field={field}
                            control={control}
                            register={register}
                            error={errors[field.name]}
                        />
                    ))}
                </fieldset>

                 {error && ( // Display submission errors here
                    <p className="text-sm text-red-600 text-center">{error}</p>
                 )}

                <div className="text-center pt-4 border-t">
                    <button type="submit" disabled={isSubmitting}
                        className="w-1/2 flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 mx-auto">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
        // Removed outer <main> tag as RootLayout provides it
    );
}