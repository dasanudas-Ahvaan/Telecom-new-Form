// This file corresponds to AdminLogin.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Call the admin login API endpoint
      const res = await axios.post(`${apiUrl}/api/admin/login`, {
        email,
        password,
      });

      if (res.data.success && res.data.token) {
        // Save the JWT token to local storage
        localStorage.setItem('admin-token', res.data.token);
        localStorage.setItem('admin-role', res.data.role);
        // Redirect to the dashboard
        router.push('/admin/dashboard');
      } else {
        setError(res.data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ❌ STRAY JSX BLOCK has been DELETED from here.

  // This is the only JSX block, and it's inside the return.
  return (
    // This is the outer container with the orange background
    <div className="min-h-screen bg-cover bg-center bg-[url('/logos/background.jpg')] flex items-center justify-center">
      
      {/* ❌ The <main ... bg-gray-100> tag has been REMOVED. */}
      
      {/* ✅ This is the yellow login box. 
          Its size is increased to `max-w-lg` (or use `max-w-xl`, `max-w-2xl` etc. as you like)
          It is now directly on the orange background.
      */}
      <div className="w-full max-w-lg mx-auto bg-yellow-100 bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg text-gray-900">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          Admin Login
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
}