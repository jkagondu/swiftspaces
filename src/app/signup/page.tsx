"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-outfit)', backgroundColor: 'var(--color-surface-secondary)', position: 'relative' }}>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        
        <div style={{ 
          width: '100%', maxWidth: '480px', 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)',
          borderRadius: '24px', 
          padding: '3rem', 
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative', zIndex: 1
        }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Logo width={36} height={36} />
            </Link>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Join SwiftSpaces</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Create an account to save your favorite properties and track inquiries.</p>
          </div>

          {error && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '12px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}
          
          {success ? (
            <div style={{ padding: '2.5rem 1.5rem', backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: 'var(--shadow-md)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Account Created!</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Email Address</label>
                <input 
                  name="email" type="email" required value={formData.email} onChange={handleInputChange}
                  placeholder="you@example.com" 
                  style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface-secondary)', color: 'var(--color-text-main)', outline: 'none', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Phone Number (Optional)</label>
                <input 
                  name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange}
                  placeholder="+254 700 000 000" 
                  style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface-secondary)', color: 'var(--color-text-main)', outline: 'none', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Password</label>
                <input 
                  name="password" type="password" required minLength={6} value={formData.password} onChange={handleInputChange}
                  placeholder="Create a secure password" 
                  style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface-secondary)', color: 'var(--color-text-main)', outline: 'none', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <button type="submit" disabled={isLoading} style={{ 
                padding: '1.25rem', width: '100%', fontSize: '1rem', fontWeight: 700, marginTop: '1rem', 
                background: 'var(--color-primary)', 
                color: 'white', border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s', opacity: isLoading ? 0.7 : 1 
              }}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>
          )}

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
            Are you a real estate agent? <Link href="/register" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>Apply Here</Link>
            <br/><br/>
            Already have an account? <Link href="/login" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
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
