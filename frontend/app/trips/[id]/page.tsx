import Link from 'next/link'
import ReactMarkdown from 'react-markdown';
import { getTrip } from '@/services/tripService';
import navbar from '@/components/navbar';
import {formatCurrency, getBudgetBadgeColor, getStyleBadgeColor} from '@/components/TripCard'

export default async function TripDetailPage({ params }: { params: { id: string }}) {
    const takeId = await params
    const tripID = parseInt(takeId.id);

    if (isNaN(tripID)) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center p-8">
                <div className="bg-white p-8 rounded-2xl shadow-md text-center border border-red-200">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Ups! ID Perjalanan Tidak Valid</h1>
                    <p className="text-gray-600 mb-6">Kami tidak bisa menemukan perjalanan dengan ID: {params.id}</p>
                    <Link href="/trips" className="bg-sky-500 text-white px-6 py-2 rounded-full font-bold hover:bg-sky-600">
                        Kembali ke Daftar
                    </Link>
                </div>
            </div>
        );
    }


    const trip = await getTrip(tripID);

    return (
        <div className="min-h-screen bg-sky-50 p-8 flex flex-col items-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 border border-sky-100">
                
                <Link href="/trips" className="text-sky-500 hover:text-sky-700 font-medium flex items-center gap-2 mb-6">
                    &larr; Back
                </Link>

                <h1 className="text-3xl font-extrabold text-gray-800 mb-8">{trip.destination}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Destination</p>
                        <p className="text-lg font-bold text-gray-800">{trip.destination}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Budget</p>
                        <p className={`text-lg font-bold text-gray-800`}>USD {formatCurrency(trip.budget)}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Style Trip</p>
                        <p className={`inline-block text-sm font-bold px-3 py-1 rounded-md ${getStyleBadgeColor(trip.travel_style)}`}>{trip.travel_style}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Days</p>
                        <p className="text-lg font-bold text-gray-800">{trip.days}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Category Trip</p>
                        <p className={`inline-block text-sm font-bold px-3 py-1 rounded-md ${getBudgetBadgeColor(trip.category)}`}>{trip.category || 'Standard'}</p>
                    </div>
                </div>

                <div className="w-full mt-8">
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-4">
                        AI Recommendation
                    </p>
                    
                    <div className="flex flex-col gap-6">    
                        {(trip.ai_recommendation || "Rekomendasi sedang diproses...")
                            .split(/(?=### Day|## Day|Day \d)/i)
                            .filter((text) => /Day \d/i.test(text) || text.length > 20)
                            .map((dayPlan, index) => (

                                <div 
                                    key={index} 
                                    className="bg-sky-600 p-6 md:p-8 rounded-2xl shadow-md border border-sky-500 hover:shadow-lg transition-shadow duration-300 text-white"
                                >
                                    <ReactMarkdown 
                                        components={{
                                            h1: ({node, ...props}) => <h1 className="text-2xl font-extrabold text-white mt-2 mb-4" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-2 mb-4" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-sky-100 mt-4 mb-2" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4 text-white" {...props} />,
                                            li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                            strong: ({node, ...props}) => <strong className="font-extrabold text-white" {...props} />,
                                            p: ({node, ...props}) => <p className="mb-4 text-sky-50 leading-relaxed" {...props} />
                                        }}
                                    >
                                        {dayPlan}
                                    </ReactMarkdown>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}