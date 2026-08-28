import React from 'react';
import Link from 'next/link';

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount)
};

export const getFlagEmoji = (destination) => {
    if (!destination) return '✈️';
    const dest = destination.toLowerCase();
    if (dest.includes('paris') || dest.includes('france') || dest.includes('prancis')) return '🇫🇷';
    if (dest.includes('jepang') || dest.includes('japan') || dest.includes('tokyo')) return '🇯🇵';
    if (dest.includes('bali') || dest.includes('indonesia')) return '🇮🇩';
    return '✈️'; 
};

export const getBudgetBadgeColor = (category) => {
    if (!category) return 'hidden';
    const cat = category.toLowerCase();
    if (cat === 'backpacker') return 'bg-green-100 text-green-700';
    if (cat === 'standard') return 'bg-blue-100 text-blue-700';
    if (cat === 'luxury') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
};

export const getStyleBadgeColor = (style) => {
    if (!style) return 'hidden';
    const st = style.toLowerCase();
    if (st === 'solo') return 'bg-orange-100 text-orange-700';
    if (st === 'couple') return 'bg-pink-100 text-pink-700';
    if (st === 'family') return 'bg-teal-100 text-teal-700';
    return 'bg-gray-100 text-gray-700';
};

export default function TripCard({ trip, className = '' }) {
    return (
        <div 
            className={`p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-l-4 border-l-sky-500 border-y border-r border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center ${className}`}
        >
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-sky-700 flex items-center gap-2">
                    <span>{getFlagEmoji(trip.destination)}</span>
                    {trip.destination}
                </h3>
                
                <p className="text-gray-500 text-sm font-medium">
                    {trip.days} days &middot; USD {formatCurrency(trip.budget)}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-md ${getBudgetBadgeColor(trip.category)}`}>
                        {trip.category}
                    </span>

                    <span className={`text-xs font-bold px-3 py-1 rounded-md ${getStyleBadgeColor(trip.travel_style)}`}>
                        {trip.travel_style}
                    </span>
                </div>
            </div>

            <Link 
                href={`/trips/${trip.id}`} 
                className="bg-sky-100 text-sky-600 hover:bg-sky-200 font-bold py-2 px-5 rounded-full transition duration-300 text-sm ml-4 whitespace-nowrap"
            >
                View Details
            </Link>
        </div>
    )
}