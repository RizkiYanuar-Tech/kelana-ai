'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ConversationSummary {
  id: number;
  title: string | null;
  created_at: string;
}

const API_BASE = 'http://127.0.0.1:8000';

function formatTime(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledOnceRef = useRef(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchConversations = async (): Promise<ConversationSummary[]> => {
    const response = await fetch(`${API_BASE}/api/v1/conversations`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Gagal memuat daftar percakapan.');
    setConversations(data);
    return data;
  };

  const createConversation = async () => {
    const response = await fetch(`${API_BASE}/api/v1/conversations`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Gagal memulai percakapan.');
    return data.conversation_id as number;
  };

  const loadMessages = async (id: number) => {
    const response = await fetch(`${API_BASE}/api/v1/conversations/${id}/messages`, {
      headers: authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Gagal memuat riwayat pesan.');
    return data.map((m: any) => ({
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
    })) as ChatMessage[];
  };

  const openConversation = async (id: number) => {
    hasScrolledOnceRef.current = false;
    setError('');
    setIsStarting(true);
    try {
      const history = await loadMessages(id);
      setConversationId(id);
      setMessages(history);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsStarting(false);
    }
  };
  
  const startNewConversation = () => {
    hasScrolledOnceRef.current = false;
    setError('');
    setConversationId(null);
    setMessages([]);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const init = async () => {
      setIsStarting(true);
      try {
        const list = await fetchConversations();
        if (list.length > 0) {
          const history = await loadMessages(list[0].id);
          setConversationId(list[0].id);
          setMessages(history);
        } else {
          setConversationId(null);
          setMessages([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsStarting(false);
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: hasScrolledOnceRef.current ? 'smooth' : 'auto',
    });
    hasScrolledOnceRef.current = true;
  }, [messages, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perbaikan: Hapus validasi !conversationId agar pesan tetap bisa diproses
    if (!input.trim() || isSending) return;

    let activeConvoId = conversationId;
    const outgoing = input.trim();
    const isFirstMessage = messages.length === 0;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: outgoing, createdAt: new Date().toISOString() },
    ]);
    setInput('');
    setIsSending(true);
    setError('');

    try {
      // Perbaikan: Buat percakapan di database jika belum ada
      if (!activeConvoId) {
        activeConvoId = await createConversation();
        setConversationId(activeConvoId);

        // Tambahkan ke sidebar agar langsung muncul
        setConversations((prev) => [
          { id: activeConvoId as number, title: null, created_at: new Date().toISOString() },
          ...prev,
        ]);
      }

      const response = await fetch(
        `${API_BASE}/api/v1/conversations/${activeConvoId}/messages`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ content: outgoing }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Gagal mengirim pesan.');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.assistant_message.content,
          createdAt: data.assistant_message.created_at,
        },
      ]);

      if (isFirstMessage) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvoId ? { ...c, title: data.conversation_title } : c
          )
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const activeTitle =
    conversations.find((c) => c.id === conversationId)?.title || 'Percakapan Baru';

  return (
    <div className="chat-page">
      <div className="absolute top-6 right-6 z-50">
        <Navbar />
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <span>Percakapan</span>
            <button type="button" onClick={startNewConversation} aria-label="Percakapan baru">
              +
            </button>
          </div>

          <div className="sidebar-list">
            {conversations.length === 0 && (
              <p className="sidebar-empty">Belum ada percakapan.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                className={c.id === conversationId ? 'convo-item convo-item-active' : 'convo-item'}
                onClick={() => openConversation(c.id)}
              >
                <span className="convo-title">{c.title || 'Percakapan Baru'}</span>
                <span className="convo-date">{formatDate(c.created_at)}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="chat-window">
          <div className="chat-header">
            <div className="window-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="chat-title">{activeTitle}</span>
            <span className="header-spacer" />
          </div>

          <div className="chat-body" ref={scrollRef}>
            {isStarting && <p className="hint-text">Menyiapkan percakapan…</p>}

            {!isStarting && messages.length === 0 && (
              <p className="hint-text">Ceritakan rencana perjalananmu, KelanaAI siap membantu.</p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'bubble bubble-user' : 'bubble bubble-assistant'}
              >
                <span className="bubble-content">{msg.content}</span>
                <span className="bubble-time">{formatTime(msg.createdAt)}</span>
              </div>
            ))}

            {isSending && (
              <div className="bubble bubble-assistant bubble-typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
          </div>

          {error && <p className="error-text">{error}</p>}

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan…"
              disabled={isStarting || isSending}
            />
            <button type="submit" disabled={isStarting || isSending || !input.trim()} aria-label="Kirim">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 11.5L21 3L13.5 21L11 13L3 11.5Z" stroke="#0b1d26" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="#0b1d26" />
              </svg>
            </button>
          </form>
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
        .chat-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 24px;
        }

        .layout {
          display: flex;
          width: 100%;
          max-width: 780px;
          height: 640px;
          gap: 16px;
        }

        .sidebar {
          width: 220px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: #11242f;
          border: 1px solid #23414f;
          border-radius: 12px;
          overflow: hidden;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: #0e1e28;
          border-bottom: 1px solid #23414f;
          color: #edeef0;
          font-size: 13px;
          font-weight: 600;
        }

        .sidebar-header button {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1px solid #23414f;
          background: transparent;
          color: #e8a33d;
          font-size: 15px;
          line-height: 1;
          cursor: pointer;
        }

        .sidebar-header button:hover {
          border-color: #e8a33d;
        }

        .sidebar-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-empty {
          color: #5c707a;
          font-size: 13px;
          text-align: center;
          margin-top: 20px;
        }

        .convo-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-start;
          background: transparent;
          border: none;
          border-radius: 8px;
          padding: 10px 12px;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .convo-item:hover {
          background: #16303d;
        }

        .convo-item-active {
          background: #16303d;
          border: 1px solid #23414f;
        }

        .convo-title {
          color: #edeef0;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .convo-date {
          color: #5c707a;
          font-size: 11px;
        }

        .chat-window {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: #11242f;
          border: 1px solid #23414f;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #0e1e28;
          border-bottom: 1px solid #23414f;
        }

        .window-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-red {
          background: #e0685a;
        }

        .dot-yellow {
          background: #e8c33d;
        }

        .dot-green {
          background: #6fbf83;
        }

        .chat-title {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 600;
          color: #edeef0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-spacer {
          flex: 1;
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hint-text {
          margin: auto;
          color: #5c707a;
          font-size: 14px;
          text-align: center;
          max-width: 260px;
        }

        .bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bubble-content {
          white-space: pre-wrap;
        }

        .bubble-time {
          font-size: 10px;
          opacity: 0.6;
          align-self: flex-end;
        }

        .bubble-user {
          align-self: flex-end;
          background: #e8a33d;
          color: #0b1d26;
          border-bottom-right-radius: 4px;
        }

        .bubble-assistant {
          align-self: flex-start;
          background: #16303d;
          border: 1px solid #23414f;
          color: #edeef0;
          border-bottom-left-radius: 4px;
        }

        .bubble-typing {
          flex-direction: row;
          gap: 4px;
          padding: 14px;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8fa3ae;
          animation: typing-bounce 1.2s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes typing-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        .error-text {
          color: #ff6b6b;
          font-size: 13px;
          margin: 0;
          padding: 0 16px 8px;
        }

        .chat-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #23414f;
          background: #0e1e28;
        }

        .chat-input-row input {
          flex: 1;
          background: #16303d;
          border: 1px solid #23414f;
          border-radius: 20px;
          padding: 10px 16px;
          color: #edeef0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .chat-input-row input:focus {
          border-color: #e8a33d;
        }

        .chat-input-row input::placeholder {
          color: #5c707a;
        }

        .chat-input-row input:disabled {
          opacity: 0.6;
        }

        .chat-input-row button {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: #e8a33d;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .chat-input-row button:hover:not(:disabled) {
          background: #f2b65a;
        }

        .chat-input-row button:disabled {
          background: #6b5a3a;
          cursor: not-allowed;
        }

        @media (max-width: 720px) {
          .layout {
            flex-direction: column;
            height: calc(100vh - 48px);
          }

          .sidebar {
            width: 100%;
            height: auto;
            max-height: 140px;
          }

          .sidebar-list {
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
          }

          .convo-item {
            flex-shrink: 0;
            min-width: 160px;
          }
        }

        @media (max-width: 560px) {
          .chat-page {
            padding: 0;
          }

          .layout {
            height: 100vh;
          }

          .chat-window {
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}