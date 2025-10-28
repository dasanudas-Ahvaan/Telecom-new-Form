// This file is Home.jsx (client/app/page.jsx)
"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  // No top-level <main> tag here, as RootLayout provides it.
  return (
    // 1. Container div with max-w-md and styling, default dark text
    <div className="max-w-md mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-center text-gray-900">
      <Image
        src="/logos/ahvaan_logo.jpg"
        alt="Ahvaan Logo"
        width={150}
        height={150}
        className="mx-auto mb-6 rounded-full"
      />

      {/* Ensure heading text is dark */}
      <h1 className="text-4xl font-bold text-blue-800 mb-4">
        अह्वान टेलीकॉम पंजीकरण प्रणाली
      </h1>
       {/* Ensure paragraph text is dark */}
      <p className="text-lg text-gray-700 mb-8">
        Ahvaan Telecom Registration System
      </p>
       {/* Ensure paragraph text is dark */}
      <p className="text-md text-gray-600 mb-10">
        पंजीकरण प्रक्रिया शुरू करने के लिए, कृपया आगे बढ़ें।
      </p>

      {/* Link styling is fine */}
      <Link
        href="/register" // <-- Ensure this points to the correct single registration page
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 inline-block" // Added inline-block
      >
        पंजीकरण आरंभ करें (Start Registration)
      </Link>

      {/* --- ADMIN LOGIN BUTTON --- */}
      <div className="mt-6 border-t pt-4">
        {/* Ensure link text is dark/visible */}
        <Link
          href="/admin/login"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline" // Use a visible color like blue
        >
          Are you an Admin? Login here
        </Link>
      </div>
    </div>
  );
}