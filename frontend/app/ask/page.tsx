'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/navbar';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // { question, answer }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAsk = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = question.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setQuestion('');

    try {
      const ask_url = `http://127.0.0.1:8000/api/v1/ask`;
      const response = await fetch(ask_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Gagal mendapatkan jawaban, coba lagi.');
      }

      setMessages((prev) => [...prev, { question: data.question, answer: data.answer }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ask-page">
      <div className="absolute top-6 right-6 z-50">
        <Navbar />
      </div>
      <div className="ask-container">
        <div className="ask-header">
          <span className="brand-name">Kelana AI</span>
          <h1>Tanya seputar rencana perjalananmu</h1>
          <p className="subtitle">
            Jawaban diambil langsung dari basis pengetahuan perjalanan KelanaAI.
          </p>
        </div>

        <div className="chat-window">
          {messages.length === 0 && !isLoading && (
            <div className="empty-state">
              <p>Belum ada percakapan. Coba tanyakan salah satu ini:</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div className="qa-pair" key={i}>
              <div className="bubble user-bubble">{msg.question}</div>
              <div className="bubble ai-bubble">{msg.answer}</div>
            </div>
          ))}

          {isLoading && (
            <div className="qa-pair">
              <div className="bubble ai-bubble thinking">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {error && <p className="error-text">{error}</p>}

        <form className="ask-form" onSubmit={handleAsk}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Tulis pertanyaanmu di sini..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !question.trim()}>
            {isLoading ? '...' : 'Tanya'}
          </button>
        </form>
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
        .ask-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .ask-container {
          width: 100%;
          max-width: 720px;
          display: flex;
          flex-direction: column;
        }

        .ask-header {
          margin-bottom: 24px;
        }

        .brand-name {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #e8a33d;
        }

        .ask-header h1 {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          color: #edeef0;
          margin: 8px 0 6px;
        }

        .subtitle {
          color: #8fa3ae;
          font-size: 14px;
          margin: 0;
        }

        .chat-window {
          flex: 1;
          min-height: 360px;
          max-height: 55vh;
          overflow-y: auto;
          background: #11242f;
          border: 1px solid #23414f;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .empty-state {
          color: #8fa3ae;
          font-size: 14px;
          text-align: center;
          margin: auto 0;
        }

        .suggestion-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
        }

        .suggestion-chip {
          background: #16303d;
          border: 1px solid #23414f;
          color: #edeef0;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .suggestion-chip:hover {
          border-color: #e8a33d;
          background: #182f3c;
        }

        .qa-pair {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .user-bubble {
          align-self: flex-end;
          background: #e8a33d;
          color: #0b1d26;
          font-weight: 500;
          border-bottom-right-radius: 2px;
        }

        .ai-bubble {
          align-self: flex-start;
          background: #16303d;
          border: 1px solid #23414f;
          color: #edeef0;
          border-bottom-left-radius: 2px;
        }

        .thinking {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 14px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8fa3ae;
          animation: blink 1.2s infinite ease-in-out;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes blink {
          0%,
          80%,
          100% {
            opacity: 0.3;
          }
          40% {
            opacity: 1;
          }
        }

        .error-text {
          color: #ff6b6b;
          font-size: 13px;
          margin: 12px 0 0;
        }

        .ask-form {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }

        .ask-form input {
          flex: 1;
          background: #16303d;
          border: 1px solid #23414f;
          border-radius: 8px;
          padding: 12px 14px;
          color: #edeef0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .ask-form input:focus {
          border-color: #e8a33d;
        }

        .ask-form input::placeholder {
          color: #5c707a;
        }

        .ask-form input:disabled {
          opacity: 0.6;
        }

        .ask-form button {
          padding: 0 22px;
          border: none;
          border-radius: 8px;
          background: #e8a33d;
          color: #0b1d26;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .ask-form button:hover:not(:disabled) {
          background: #f2b65a;
        }

        .ask-form button:disabled {
          background: #6b5a3a;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .bubble {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
}