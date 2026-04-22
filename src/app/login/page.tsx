'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        setError('गलत पासवर्ड (Wrong password)');
      }
    } catch {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
      padding: '1rem',
    }}>
      <div className="animate-in" style={{
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          fontSize: '3rem',
          marginBottom: '0.5rem',
        }}>🚛</div>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: '0.25rem',
        }}>Shri Balaji Sarkar Firms</h1>
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          fontSize: '0.95rem',
        }}>रेती कारोबार हिसाब-किताब</p>

        <form onSubmit={handleLogin} className="card" style={{ textAlign: 'left' }}>
          <label className="label" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
            पासवर्ड (Password)
          </label>
          <input
            type="password"
            className="input"
            placeholder="पासवर्ड दर्ज करें..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ fontSize: '1.1rem', padding: '0.85rem', marginBottom: '1rem' }}
            autoFocus
          />

          {error && (
            <p style={{ color: 'var(--red)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              ❌ {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '0.85rem' }}
          >
            {loading ? <span className="spinner" /> : '🔐 लॉगिन करें'}
          </button>
        </form>
      </div>
    </div>
  );
}
