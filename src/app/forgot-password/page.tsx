"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-outfit)', backgroundColor: 'var(--color-surface-secondary)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '480px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '3rem', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}><Link href="/" style={{ textDecoration: 'none' }}><Logo width={36} height={36} /></Link></div>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Forgot Password</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Enter your email to receive a password reset link.</p>
          </div>
          {error && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '12px', fontSize: '0.875rem' }}>{error}</div>
          )}
          {success ? (
            <div style={{ padding: '2.5rem 1.5rem', backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', borderRadius: '16px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Link Sent!</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>If an account exists, a reset link has been sent to your email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)', width: '100%', fontSize: '1rem' }} />
              </div>
              <button type="submit" disabled={isLoading} style={{ padding: '1.25rem', width: '100%', fontSize: '1rem', fontWeight: 700, marginTop: '1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <Link href="/login" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
