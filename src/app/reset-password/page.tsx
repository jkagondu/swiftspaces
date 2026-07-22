"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Invalid or missing token. <Link href="/forgot-password" style={{ color: '#10B981' }}>Try again</Link></div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Set New Password</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Enter your new password below.</p>
      </div>
      {error && <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '12px' }}>{error}</div>}
      {success ? (
        <div style={{ padding: '2.5rem', backgroundColor: 'var(--color-primary-light)', color: '#047857', borderRadius: '16px', textAlign: 'center' }}>
          Password successfully reset! Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>New Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)', width: '100%', fontSize: '1rem' }} />
          </div>
          <button type="submit" disabled={isLoading} style={{ padding: '1.25rem', width: '100%', fontSize: '1rem', fontWeight: 700, background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? "Resetting..." : "Update Password"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--color-surface-secondary)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '480px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '3rem', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}><Logo width={36} height={36} /></div>
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
