'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }

    setIsLoading(true);

    try {
      const register_url = `http://127.0.0.1:8000/api/v1/auth/register`;
      const response = await fetch(register_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registrasi gagal, coba lagi.');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="brand-panel">
        <div className="brand-content">
          <span className="brand-name">KelanaAI</span>
          <p className="brand-tagline">Rencanakan perjalanan, bukan cuma mimpi.</p>

          <svg className="route-svg" viewBox="0 0 320 160" fill="none">
            <path
              id="route-path"
              d="M20 130 C 90 20, 190 190, 300 30"
              stroke="#E8A33D"
              strokeWidth="2"
              strokeDasharray="6 8"
            />
            <circle cx="20" cy="130" r="4" fill="#E8A33D" />
            <circle cx="300" cy="30" r="4" fill="#E8A33D" />
          </svg>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-card">
          <h1>Buat akun</h1>
          <p className="subtitle">Mulai susun rencana perjalananmu dalam beberapa menit.</p>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleRegister}>
            <label htmlFor="name">Nama</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nama lengkap"
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@email.com"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimal 8 karakter"
            />

            <label htmlFor="confirmPassword">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Ulangi password"
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="switch-text">
            Sudah punya akun? <a href="/login">Masuk di sini</a>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        html,
        body {
          margin: 0;
          padding: 0;
          background: #0b1d26;
        }
      `}</style>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
        }

        .brand-panel {
          flex: 1;
          background: linear-gradient(160deg, #0b1d26 0%, #123342 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }

        .brand-content {
          max-width: 340px;
          color: #edeef0;
        }

        .brand-name {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 600;
          color: #edeef0;
        }

        .brand-tagline {
          margin-top: 12px;
          color: #8fa3ae;
          font-size: 15px;
          line-height: 1.5;
        }

        .route-svg {
          margin-top: 40px;
          width: 100%;
          height: auto;
        }

        #route-path {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: draw-route 1.8s ease forwards 0.3s;
        }

        @keyframes draw-route {
          to {
            stroke-dashoffset: 0;
          }
        }

        .form-panel {
          flex: 1;
          background: #11242f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .form-card {
          width: 100%;
          max-width: 360px;
        }

        .form-card h1 {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          color: #edeef0;
          margin: 0 0 8px;
        }

        .subtitle {
          color: #8fa3ae;
          font-size: 14px;
          margin: 0 0 28px;
        }

        .error-text {
          color: #ff6b6b;
          font-size: 14px;
          margin-bottom: 16px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          color: #8fa3ae;
          font-size: 13px;
          margin-top: 14px;
        }

        input {
          background: #16303d;
          border: 1px solid #23414f;
          border-radius: 6px;
          padding: 10px 12px;
          color: #edeef0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        input:focus {
          border-color: #e8a33d;
        }

        input::placeholder {
          color: #5c707a;
        }

        button {
          margin-top: 26px;
          padding: 12px;
          border: none;
          border-radius: 6px;
          background: #e8a33d;
          color: #0b1d26;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        button:hover:not(:disabled) {
          background: #f2b65a;
        }

        button:disabled {
          background: #6b5a3a;
          cursor: not-allowed;
        }

        .switch-text {
          margin-top: 24px;
          color: #8fa3ae;
          font-size: 14px;
          text-align: center;
        }

        .switch-text a {
          color: #e8a33d;
          text-decoration: none;
        }

        .switch-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 860px) {
          .brand-panel {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}