// client/app/admin/dashboard/page.jsx
"use client";

import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  
  const router = useRouter();
  const [adminRole, setAdminRole] = useState(null);

  const getToken = () => localStorage.getItem('admin-token');

  useEffect(() => {
    const role = localStorage.getItem('admin-role');
    setAdminRole(role);

    
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-role'); // Clear the role
    router.push('/admin/login');
  };

  return (

    <div className="max-w-7xl mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            {/* Ensure heading text is dark */}
            <h1 className="text-3xl font-bold text-blue-800">Admin Dashboard</h1>
            
            {/* --- Buttons Section MODIFIED --- */}
            <div className="flex flex-wrap gap-2">

                {/* Manage Admins only for Owner */}
                {adminRole === 'Owner' && (
                  <Link href="/admin/manage-admins"
                    className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75">
                    Manage Admins
                  </Link>
                )}

                <Link href="/admin/editor"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
                    Form Editor
                </Link>
                <button onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
                    Logout
                </button>
            </div>
        </div>

        {/* --- Error display REMOVED (or can be kept for other errors if needed) --- */}
        {/* {error && <p className="text-red-600 mb-4">{error}</p>} */}

        {/* --- NEW SECTION for Navigation --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t pt-6">
            
            {/* Card for "To Call" */}
            <Link href="/admin/to-call" className="block p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-500">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">Users to Call</h2>
              <p className="text-gray-600">View and manage all newly registered users who are waiting for verification call.</p>
            </Link>

            {/* Card for "Verified Users" */}
            <Link href="/admin/verified-users" className="block p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-green-500">
              <h2 className="text-2xl font-semibold text-green-700 mb-2">Verified Users</h2>
              <p className="text-gray-600">View the list of all users who have been successfully contacted and verified.</p>
            </Link>
            {/* Card for "Inactive Users" */}
        <Link href="/admin/inactive-users" className="block p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-red-500">
          <h2 className="text-2xl font-semibold text-red-700 mb-2">Inactive Users</h2>
          <p className="text-gray-600">View users who have been marked as inactive.</p>
        </Link>
            
        </div>
        
        {/* --- Main Table REMOVED --- */}
        {/* <div className="overflow-x-auto"> ... </div> */}

    </div>
  );
}
