'use client'; // Wajib di Next.js App Router jika menggunakan hooks seperti useState dan useRouter

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // Variabel untuk menyimpan input form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Variabel untuk menangani pesan error dan status loading
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  // 3. Fungsi yang dijalankan saat tombol "Login" diklik
  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah halaman refresh saat form dikirim
    setError('');       // Reset pesan error sebelumnya
    setIsLoading(true); // Mengaktifkan mode loading

    try {
      const login_url = `http://127.0.0.1:8000/api/v1/auth/login`;
      // 4. Mengirim request POST ke endpoint backend FastAPI
      const response = await fetch(login_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 5. Cek apakah response dari server gagal (misal salah password)
      if (!response.ok) {
        throw new Error(data.detail || 'Gagal login, periksa kembali email dan passwordmu.');
      }

      // 6. Jika berhasil, simpan token ke dalam localStorage browser
      // Backend FastAPI-mu mereturn data dengan key "access_token"
      localStorage.setItem('token', data.access_token);
      
      // 7. Arahkan pengguna ke halaman utama atau dashboard perjalanan setelah sukses
      router.push('/form'); 
      
    } catch (err) {
      // Tampilkan pesan error ke layar jika ada yang salah
      setError(err.message);
    } finally {
      // Matikan mode loading baik saat berhasil maupun gagal
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Login KelanaAI</h2>
      
      {/* Jika ada error, tampilkan teks berwarna merah */}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '10px', 
            backgroundColor: isLoading ? '#a0c4ff' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isLoading ? 'not-allowed' : 'pointer' 
          }}
        >
          {isLoading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </div>
  );
}