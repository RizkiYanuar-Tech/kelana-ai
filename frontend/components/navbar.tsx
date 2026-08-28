'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar(){
    const pathName = usePathname();

    return (
        <nav className="flex justify-center z-50 w-full">
            <div className="flex justify-center gap-4">
                <Link 
                    href="/" 
                    className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                        pathName === '/' 
                            ? 'bg-sky-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-500 hover:bg-sky-100 hover:text-sky-600'
                    }`}
                >
                    Generate Trip
                </Link>

                <Link 
                    href="/trips" 
                    className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                        pathName.startsWith('/trips') 
                            ? 'bg-sky-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-500 hover:bg-sky-100 hover:text-sky-600'
                    }`}
                >
                    Trip History
                </Link>

            </div>
        </nav>
    );
}