// client/app/admin/registrations/[id]/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function RegistrationDetailsPage() {
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const params = useParams();
    const router = useRouter();
    const registrationId = params.id;

    const getToken = () => localStorage.getItem('admin-token');

    useEffect(() => {
        if (!registrationId) return;

        const token = getToken();
        if (!token) {
            router.push('/admin/login');
            return;
        }

        const fetchRegistration = async () => {
            setLoading(true);
            setError('');
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.get(`${apiUrl}/api/admin/registrations/${registrationId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.data.success) {
                    setRegistration(res.data.registration);
                } else {
                    setError(res.data.message || 'Failed data.');
                }
            } catch (err) {
                console.error("Fetch err:", err);
                setError(err.response?.data?.message || 'Error loading.');
                if (err.response?.status === 404) { setError('Not found.'); }
                else if (err.response?.status === 401) { router.push('/admin/login'); }
            } finally {
                setLoading(false);
            }
        };

        fetchRegistration();
    }, [registrationId, router]);

    if (loading) {
        // Ensure loading text is dark
        return <main className="flex min-h-screen items-center justify-center"><p className="text-gray-900">Loading Registration Details...</p></main>;
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center p-8">
                 {/* 1. Wrap error content */}
                <div className="max-w-md mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-center text-gray-900"> {/* Added text color */}
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
                </div>
            </main>
        );
    }

    if (!registration) {
         // Ensure message text is dark
         return <main className="flex min-h-screen items-center justify-center"><p className="text-gray-900">No registration data found.</p></main>;
    }

    // --- Main Return ---
    return (
        // 1. Wrap main content in styled div (max-w-4xl)
        // Added text-gray-900 for default dark text
        <div className="max-w-4xl mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
            <div className="flex justify-between items-center mb-6">
                {/* Ensure heading is dark */}
                <h1 className="text-3xl font-bold text-blue-800">Registration Details</h1>
                 <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
            </div>

            {/* Ensure all details text is dark */}
            <div className="space-y-3"> {/* Adjusted spacing */}
                <p><strong>Registration ID:</strong> {registration.registrationId}</p>
                <p><strong>Date Registered:</strong> {new Date(registration.createdAt).toLocaleString()}</p>
                <hr className="my-4"/> {/* Added margin to hr */}
                <h2 className="text-xl font-semibold text-gray-800">Submitted Data</h2>
                {/* Display static fields first */}
                 <p><strong>First Name:</strong> {registration.firstName || <span className="text-gray-500 italic">N/A</span>}</p> {/* Use span for N/A */}
                 <p><strong>Last Name:</strong> {registration.lastName || <span className="text-gray-500 italic">N/A</span>}</p>
                 <p><strong>Email:</strong> {registration.email}</p>
                 <p><strong>Mobile:</strong> {registration.mobile}</p>
                 <hr className="my-4"/>
                 {/* Display dynamic fields */}
                 {/* Ensure labels and values are dark */}
                 {registration.formData?.length > 0 ? (
                     registration.formData.map((field, index) => (
                         <p key={index}>
                             <strong className="text-gray-700">{field.label}:</strong> {/* Slightly lighter label */}
                             <span className="ml-2"> {/* Add space */}
                                 {Array.isArray(field.value)
                                     ? field.value.join(', ')
                                     : (field.value !== null && field.value !== undefined ? String(field.value) : <span className="text-gray-500 italic">N/A</span>) // Handle null/undefined and ensure string conversion
                                 }
                             </span>
                         </p>
                     ))
                 ) : (
                    <p className="text-gray-500 italic">No additional form data submitted.</p>
                 )}
            </div>

            {/* Buttons Section */}
            <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                 <Link href={`/admin/registrations/${registrationId}/edit`} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Edit</Link>

             </div>
        </div>
        // Removed outer <main> tag
    );
}