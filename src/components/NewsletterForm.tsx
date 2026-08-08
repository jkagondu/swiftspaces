'use client';

import React, { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, query: { type: 'newsletter' } }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '12px', textAlign: 'center', color: 'white', fontWeight: 600 }}>
        Thanks for subscribing! You're now in the Inner Circle.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
      <input 
        type="email" 
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address" 
        style={{ flex: '1 1 200px', minWidth: '0', padding: '1rem', borderRadius: '8px', border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'var(--color-text-main)', fontSize: '1rem' }} 
      />
      <button 
        type="submit" 
        disabled={status === 'loading'}
        className="btn" 
        style={{ flex: '1 1 auto', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 600, backgroundColor: 'var(--color-navy)', color: 'white', whiteSpace: 'nowrap', opacity: status === 'loading' ? 0.7 : 1 }}
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <div style={{ width: '100%', color: '#ef4444', fontSize: '0.875rem', padding: '0 0.5rem' }}>
          An error occurred. Please try again.
        </div>
      )}
    </form>
  );
}
