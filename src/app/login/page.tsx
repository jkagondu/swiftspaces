"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        const session = await getSession();
        const role = (session?.user as any)?.role;
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "CUSTOMER") {
          router.push("/saved");
        } else {
          router.push("/manager");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-outfit)', backgroundColor: 'var(--color-surface-secondary)', position: 'relative' }}>
      
      {/* Centered Premium Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        
        <div style={{ 
          width: '100%', maxWidth: '480px', 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)',
          borderRadius: '24px', 
          padding: '3rem', 
          boxShadow: 'var(--shadow-lg)',
          position: 'relative', zIndex: 1
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Logo width={36} height={36} />
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Welcome Back</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '12px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Email Address</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="agent@example.com" 
                style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface-secondary)', color: 'var(--color-text-main)', outline: 'none', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Password</label>
                <Link href="#" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface-secondary)', color: 'var(--color-text-main)', outline: 'none', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <button type="submit" disabled={isLoading} style={{ 
              padding: '1.25rem', width: '100%', fontSize: '1rem', fontWeight: 700, marginTop: '1rem', 
              background: 'var(--color-primary)', 
              color: 'white', border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer', 
              boxShadow: 'var(--shadow-md)', transition: 'all 0.2s', opacity: isLoading ? 0.7 : 1 
            }}>
              {isLoading ? "Authenticating..." : "Sign In to Portal"}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Don't have an account? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Apply as an Agent</Link>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 1024px) {
          .md-flex { display: flex !important; }
        }
      `}} />
    </div>
  );
}
