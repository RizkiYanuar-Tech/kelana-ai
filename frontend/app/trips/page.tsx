import { getTrips } from "@/services/tripService";
import TripCard from "@/components/TripCard";
import Link from "next/link";
import Navbar from '@/components/navbar';
import Pagination from '@/components/pagination';

export default async function TripsPage({searchParams}: {searchParams: {page?: string} }){
    const trips = await getTrips()
    
    const resolvedParams = await searchParams;
    const currentPage = parseInt(resolvedParams.page || '1', 10);
    const items_per_page = 5;

    const totalPages = Math.ceil(trips.length / items_per_page);
    const startIndex = (currentPage - 1) * items_per_page;
    const currentTrips = trips.slice(startIndex, startIndex + items_per_page);
    return (
        <div className="min-h-screen bg-sky-50 p-8 flex flex-col">
            <div className='relative flex flex-col md:flex-row md:justify-center items-center mb-8 gap-6 w-full'>
                <h1 className="text-3xl font-extrabold text-sky-700 text-center">
                    Trip History
                </h1>
                <div className="md:absolute md:right-0">
                    <Navbar />
                </div>
            </div>
            
            <div className="flex-grow w-full max-w-2xl mx-auto">
                {trips.length === 0 ? (
                    <div className="bg-teal-600 rounded-2xl p-12 text-center text-white shadow-lg mt-10">
                        <svg className="w-16 h-16 mx-auto mb-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                        
                        <h2 className="text-2xl font-bold mb-2">No trips found.</h2>
                        <p className="mb-8 text-teal-100">Create your first itinerary.</p>
                        
                        <Link 
                            href="/" 
                            className="inline-block bg-white text-teal-600 font-bold py-3 px-8 rounded-full hover:bg-teal-50 hover:shadow-md transition duration-300"
                        >
                            Generate a Trip &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {currentTrips.map((t: any) => (
                            <TripCard key={t.id} trip={t} />
                        ))}
                    </div>
                )}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    )
}