import Link from 'next/link';

interface PaginationProps{
    currentPage: number;
    totalPages: number;
}

export default function Pagination({currentPage, totalPages}: PaginationProps){
    if (totalPages <= 1) {
        return null;
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            {currentPage > 1 ? (
                <Link 
                    href={`/trips?page=${currentPage - 1}`}
                    className="bg-white border border-sky-300 text-sky-600 px-4 py-2 rounded-lg font-bold hover:bg-sky-50 transition-all shadow-sm"
                >
                    &larr; Previous
                </Link>
            ) : (
                <span className="bg-gray-100 border border-gray-200 text-gray-400 px-4 py-2 rounded-lg font-bold cursor-not-allowed">
                    &larr; Previous
                </span>
            )}

            <span className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
                <Link 
                    href={`/trips?page=${currentPage + 1}`}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-sky-600 transition-all shadow-sm"
                >
                    Next &rarr;
                </Link>
            ) : (
                <span className="bg-gray-100 border border-gray-200 text-gray-400 px-4 py-2 rounded-lg font-bold cursor-not-allowed">
                    Next &rarr;
                </span>
            )}
        </div>
    );
}