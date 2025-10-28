// This file corresponds to Dashboard.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function Dashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const getToken = () => localStorage.getItem('admin-token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/api/admin/registrations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setRegistrations(res.data.registrations);
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data. You may be logged out.');
        if (err.response?.status === 401) {
          localStorage.removeItem('admin-token');
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleExport = async () => {
    const token = getToken();
    if (!token) return router.push('/admin/login');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.get(`${apiUrl}/api/admin/report/export`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'registrations.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError('Failed to download report.');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading Dashboard...</p>
      </main>
    );
  }

return (
    <main className="min-h-screen bg-[url('/logos/background.jpg')] p-0 sm:p-8"> {/* Adjusted padding/bg */}
        {/* White box for content */}
        <div className="max-w-7xl mx-auto bg-white bg-opacity-95 p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-blue-800">Admin Dashboard</h1>
                {/* --- Button styling - ensure white text is readable --- */}
                <div className="flex flex-wrap gap-2">
                     <Link href="/admin/manage-admins"
                        className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75">
                        Manage Admins
                     </Link>
                    <Link href="/admin/data-explorer"
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                        Data Explorer
                    </Link>
                    <Link href="/admin/editor"
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
                        Go to Form Editor
                    </Link>
                    <button onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75">
                        Export to CSV
                    </button>
                    <button onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
                        Logout
                    </button>
                </div>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* --- Table --- */}
            <div className="overflow-x-auto">
                { /* ... table jsx - to ensure text inside is dark (default should be fine) ... */ }
            </div>
        </div>
    </main>
);
}