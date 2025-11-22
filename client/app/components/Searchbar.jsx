// client/app/components/Searchbar.jsx
"use client";

import { useState } from 'react';

/**
 * A reusable search bar component.
 * @param {object} props
 * @param {function(string): void} props.onSearch - The function to call when a search is submitted.
 * @param {boolean} [props.isLoading] - Optional: Disables the form when loading.
 */
export default function Searchbar({ onSearch, isLoading = false }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or mobile..."
                disabled={isLoading}
                className="flex-grow mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                           text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md 
                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:ring-opacity-75 disabled:bg-gray-400"
            >
                Search
            </button>
            {/* Optional: Add a clear button */}
            {query && (
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                        setQuery(''); // Clear local input
                        onSearch(''); // Trigger a search for everything
                    }}
                    className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md 
                               hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 
                               focus:ring-opacity-75 disabled:bg-gray-400"
                >
                    Clear
                </button>
            )}
        </form>
    );
}