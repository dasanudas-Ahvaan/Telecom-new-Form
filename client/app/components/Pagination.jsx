// client/app/components/Pagination.jsx
"use client";

/**
 * A reusable pagination component.
 * @param {object} props
 * @param {number} props.currentPage - The current active page.
 * @param {number} props.totalPages - The total number of pages available.
 * @param {function(number): void} props.onPageChange - Function to call with the new page number.
 * @param {boolean} [props.isLoading] - Optional: Disables buttons when loading.
 */
export default function Pagination({ currentPage, totalPages, onPageChange, isLoading = false }) {
    if (totalPages <= 1) {
        return null; // Don't render pagination if there's only one page
    }

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // Create page numbers
    let pages = [];
    // Logic for complex pagination (e.g., 1 ... 4 5 6 ... 10)
    // For simplicity, we'll just show Prev/Next and Page X of Y
    
    return (
        <div className="flex justify-between items-center mt-6">
            <button
                onClick={handlePrev}
                disabled={isLoading || currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold 
                           rounded-lg shadow-sm hover:bg-gray-50 disabled:bg-gray-100 
                           disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            
            <span className="text-sm text-gray-700">
                Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </span>

            <button
                onClick={handleNext}
                disabled={isLoading || currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold 
                           rounded-lg shadow-sm hover:bg-gray-50 disabled:bg-gray-100 
                           disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
}