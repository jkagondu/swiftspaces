"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ customerName: "", rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/agents/${agentId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ customerName: "", rating: 5, comment: "" });
        router.refresh(); // Refresh the page to show new review
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '2rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid rgba(15, 118, 110, 0.2)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Thank you for your review!</h3>
        <p>Your feedback helps our community.</p>
        <button onClick={() => setSuccess(false)} className="btn btn-outline" style={{ marginTop: '1rem' }}>Submit Another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Leave a Review</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Your Name</label>
          <input 
            required 
            type="text" 
            value={formData.customerName} 
            onChange={e => setFormData({ ...formData, customerName: e.target.value })} 
            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Rating</label>
          <select 
            value={formData.rating} 
            onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })} 
            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
          >
            <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
            <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
            <option value="3">⭐⭐⭐ (3 - Average)</option>
            <option value="2">⭐⭐ (2 - Poor)</option>
            <option value="1">⭐ (1 - Terrible)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Comment</label>
          <textarea 
            required 
            rows={4} 
            value={formData.comment} 
            onChange={e => setFormData({ ...formData, comment: e.target.value })} 
            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
          ></textarea>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
