"use client"; // Needed for usePathname

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Hook to check the current URL

export default function Navbar() {
    const pathname = usePathname();
    const isAdminSection = pathname.startsWith('/admin');
    //  Check if specifically on the login page ---
    const isOnAdminLogin = pathname === '/admin/login';

    return (
        <nav className="bg-white bg-opacity-90 shadow-md sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logos/ahvaan_logo.jpg" alt="Ahvaan Logo"
                        width={40} height={40} className="rounded-full"
                    />
                    <span className="text-lg font-semibold text-blue-800 hidden sm:block">
                        Ahvaan Telecom
                    </span>
                </Link>

                {/* Navigation Links - Updated Logic */}
                <div className="space-x-4">
                    {/* --- Show Admin Links ONLY if in admin section AND NOT on login page --- */}
                    {isAdminSection && !isOnAdminLogin && (
                        <>
                            <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                            <Link href="/admin/editor" className="text-gray-700 hover:text-blue-600">Form Editor</Link>
                            <Link href="/admin/data-explorer" className="text-gray-700 hover:text-blue-600">Data Explorer</Link>
                            <Link href="/admin/manage-admins" className="text-gray-700 hover:text-blue-600">Manage Admins</Link>
                       
                        </>
                    )}

                    {/* --- Show Public Links if NOT in admin section --- */}
                    {!isAdminSection && (
                        <>
                            <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                            { !pathname.startsWith('/start-registration') && !pathname.startsWith('/otp') && !pathname.startsWith('/register') &&
                                <Link href="/start-registration" className="text-gray-700 hover:text-blue-600">Start Registration</Link>
                            }
                            <Link href="/admin/login" className="text-gray-700 hover:text-blue-600">Admin Login</Link>
                        </>
                    )}

                    {/* --- Show NOTHING on the right if on Admin Login page --- */}
                    {/* (No code needed here, the conditions above handle it) */}
                </div>
            </div>
        </nav>
    );
}