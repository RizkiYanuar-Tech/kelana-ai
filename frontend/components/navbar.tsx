'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathName = usePathname();

    return (
        <nav className="flex justify-center z-50 w-full">
            <div className="flex justify-center gap-3 bg-[#11242f] border border-[#23414f] rounded-full p-1.5 shadow-lg">
                <Link
                    href="/form"
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                        pathName.startsWith('/form')
                            ? 'bg-[#e8a33d] text-[#0b1d26] shadow-md'
                            : 'text-[#8fa3ae] hover:bg-[#16303d] hover:text-[#edeef0]'
                    }`}
                >
                    Generate Trip
                </Link>

                <Link
                    href="/trips"
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                        pathName.startsWith('/trips')
                            ? 'bg-[#e8a33d] text-[#0b1d26] shadow-md'
                            : 'text-[#8fa3ae] hover:bg-[#16303d] hover:text-[#edeef0]'
                    }`}
                >
                    Trip History
                </Link>

                <Link
                    href="/ask"
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                        pathName.startsWith('/ask')
                            ? 'bg-[#e8a33d] text-[#0b1d26] shadow-md'
                            : 'text-[#8fa3ae] hover:bg-[#16303d] hover:text-[#edeef0]'
                    }`}
                >
                    Knowledge AI
                </Link>
                <Link
                    href="/chat"
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                        pathName.startsWith('/chat')
                            ? 'bg-[#e8a33d] text-[#0b1d26] shadow-md'
                            : 'text-[#8fa3ae] hover:bg-[#16303d] hover:text-[#edeef0]'
                    }`}
                >
                    Chat AI
                </Link>
            </div>
        </nav>
    );
}