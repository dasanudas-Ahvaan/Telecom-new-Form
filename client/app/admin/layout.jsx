"use client"; // Required for useEffect and useRouter

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isVerified, setIsVerified] = useState(false); // Track verification status

    useEffect(() => {
        // Allow access to the login page itself
        if (pathname === '/admin/login') {
            setIsVerified(true); // Treat login page as "verified" access
            return;
        }

        // Check for token on other admin pages
        const token = localStorage.getItem('admin-token');

        if (!token) {
            console.log("No admin token found, redirecting to login.");
            router.replace('/admin/login'); // Use replace to prevent back button issues
        } else {
            // Basic token validation (e.g., check if it's not empty)
            // More robust validation (checking expiry) would require jwt-decode
            if (token.length < 20) { // Example: very basic check
                 console.log("Invalid admin token found, redirecting to login.");
                 localStorage.removeItem('admin-token'); // Clear invalid token
                 router.replace('/admin/login');
            } else {
                console.log("Admin token found, allowing access.");
                setIsVerified(true); // Token exists, allow rendering
            }
        }
    }, [pathname, router]); // Re-run check if path changes

    // Render children only after verification is confirmed or if on login page
    // This prevents briefly showing protected content before redirect
    if (!isVerified) {
     
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Verifying access...</p>
            </div>
        );
    }

    // If verified (or on login page), render the actual admin page content
    return <>{children}</>;
}