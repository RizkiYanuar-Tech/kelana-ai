'use client'

import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import {useState} from "react";

export default function Home() {
  // Simpan input pengguna
  const [form, setForm] = useState({
    destination: '',
    budget: '',
    days: '',
    travel_style: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | (null)>(null);
  const [error, setError] = useState<string | (null)>(null);

  // Handle Perubahan input
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Create Trip Backend
      const CreateTrip = await fetch("http://127.0.0.1:8000/api/v1/trips", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: form.destination,
          budget: parseFloat(form.budget),
          days: parseInt(form.days),
          travel_style: form.travel_style
        })
      });

      if (!CreateTrip.ok){
        throw new Error("Gagal Membuat Rencana Trip.");
      }

      const tripData = await CreateTrip.json();
      const tripID = tripData.id;

      // Buat rekomendasi ke AI
      const TripPlan = await fetch(`http://127.0.0.1:8000/api/v1/trips/${tripID}/generate`, {
        method: "POST",
      });

      if(!TripPlan.ok){
        throw new Error("AI gagal menghasilkan rekomendasi trip");
      }

      const generateTrip = await TripPlan.json()
      setResult(generateTrip.recommendation);
    
    } catch(error){
      console.error(error);
      setError("Terjadi kesalahan, pastikan backend telah nyala");
    } finally {
      setIsLoading(false);
    }
  };

  let spinner = null;
    if (isLoading) {
    spinner = (
      <svg 
        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white shrink-0" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
  }

  return (
 <div className='min-h-screen flex flex-col bg-sky-300 dark:bg-gray-900'>
  <div className='flex-grow flex items-center justify-center p-4'>
      <main className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center'>
        <div className='w-full h-48 md:h-64 relative mb-6 rounded-1 overflow-hidden shadow-sm'>
        <Image
          src="/japan.jpeg"
          fill
          alt="Pemandangan Destinasi Wisata"
          className="object-cover"
          priority
        />
        </div>
        <h1 className='text-4xl font-extrabold text-sky-600 dark:text-sky-400 mb-2'>
          Kelana AI
        </h1>
        <p className='text-gray-600 dark:text-gray-300 mb-8 font-medium'>
          Plan Your Trip With AI
        </p>

        <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
          <div className='flex flex-col text-left'>
            <label htmlFor='destination' className='text-sm font-bold text-gray-700 dark:text-gray-200 mb-1'>
              Destinasi liburan ke mana?
            </label>
            <input 
              type='text' 
              id='destination'
              value={form.destination}
              onChange={handleChange}
              placeholder='Contoh: Bali, Jepang, Paris...' 
              className='border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white transition'
              required
            />
          </div>

          <div className='flex flex-col text-left'>
            <label htmlFor='budget' className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
              Berapa Budget yang disediakan? (USD)
            </label>
            <input
              type='number'
              id='budget'
              value={form.budget}
              onChange={handleChange}
              placeholder='2000'
              className='border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white transition'
              required
            />
          </div>

          <div className='flex flex-col text-left'>
            <label htmlFor='days' className='text-sm font-bold text-gray-700 dark:text-gray-200 mb-1'>
              Rencana Berapa Hari?
            </label>
            <input 
              type='number'
              min='1'
              id='days'
              value={form.days}
              onChange={handleChange} 
              placeholder='5'
              className='border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white transition'
              required
            />
          </div>

          <div className='flex flex-col text-left'>
            <label htmlFor='travel_style' className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
              Travel Mau Bertemakan Apa?
            </label>
            <input
              type='text'
              id='travel_style'
              value={form.travel_style}
              onChange={handleChange}
              placeholder='Contoh: Cultural, Family.....'
              className='border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white transition'
              required
            />
          </div>

          <button 
            type='submit'
            disabled ={isLoading}
            className='mt-4 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:bg-gray-600'>
            {spinner}
            <span>
              {isLoading ? 'AI merencanakan trip...' : 'Buat Rencana Perjalanan'}
            </span>
          </button>
        </form>

        {error && (
          <div className='mt-8 p-4 bg-red-100 text-red-700 rounded-lg w-full text-left'>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-10 w-full text-left">
            <h2 className="text-2xl font-extrabold text-sky-700 dark:text-sky-300 mb-6 text-center border-b-2 border-sky-200 pb-4">
              Rencana Perjalanan Kamu
            </h2>
            
            {/*Atur Posisi Card */}
            <div className="flex flex-col gap-8">
              {result.split(/(?=### Day|## Day|Day \d)/i)
                .filter((text) => /Day \d/i.test(text))
                .map((dayPlan, index) => (

                  // Tampilan Card
                  <div 
                    key={index} 
                    className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-sky-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
                  >
                    <ReactMarkdown
                    // styling markdown agar list tidak disembunyikan
                      components={{
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-4" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
                        
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mt-4 mb-4" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-sky-700 dark:text-sky-400 mt-4 mb-4" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-sky-600 dark:text-sky-300 mt-4 mb-3" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-bold text-sky-600 dark:text-sky-300 mt-3 mb-2" {...props} />,
                        
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,
                        
                        p: ({node, ...props}) => <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
                      }}
                    >
                      {dayPlan}
                    </ReactMarkdown>
                  </div>
              ))}
            </div>
          </div>
        )}
      </main>
      </div>
      <footer className="bg-white dark:bg-gray-800 rounded-t-xl shadow-xs border-t border-gray-200 mt-auto">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-white-500 sm:text-center">© 2026 <a href="#" className="hover:underline">Kelana AI™</a>. All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white-500 sm:mt-0">
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">About</a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
            </li>
            <li>
              <a href="#" className="hover:underline">Contact</a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
