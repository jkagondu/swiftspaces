"use client";

import { useState } from "react";

export default function InquiryForm({ propertyId }: { propertyId: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, propertyId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send inquiry.");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#047857', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Message Sent!</h4>
        <p style={{ fontSize: '0.875rem' }}>The agent will get back to you shortly.</p>
        <button onClick={() => setSuccess(false)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#10b981', textDecoration: 'underline', cursor: 'pointer' }}>Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#b91c1c', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      <input 
        type="text" 
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your Name" 
        required 
        style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} 
      />
      <input 
        type="email" 
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email Address" 
        required 
        style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} 
      />
      <input 
        type="tel" 
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone Number" 
        style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} 
      />
      <textarea 
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Hi, I'm interested in this property..." 
        rows={4} 
        required 
        style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', resize: 'vertical' }}
      ></textarea>
      <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '1rem', width: '100%', fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
