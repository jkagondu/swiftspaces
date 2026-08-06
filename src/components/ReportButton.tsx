"use client";

import React, { useState } from "react";

export default function ReportButton({ propertyId }: { propertyId: string }) {
  const [isReporting, setIsReporting] = useState(false);

  const handleReport = async () => {
    const reason = window.prompt("Why are you reporting this listing? (e.g., Scam, Fake Photos, Incorrect Info)");
    if (!reason) return;

    setIsReporting(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (res.ok) {
        alert("Thank you. This property has been reported and will be reviewed by the SwiftSpaces admin team.");
      } else {
        alert("Failed to submit report. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <button 
      onClick={handleReport}
      disabled={isReporting}
      style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: isReporting ? 'not-allowed' : 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', opacity: isReporting ? 0.5 : 1 }}
      onMouseOver={(e) => { if (!isReporting) e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
      onMouseOut={(e) => { if (!isReporting) e.currentTarget.style.backgroundColor = 'transparent'; }}
      title="Report this listing as a scam"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
      {isReporting ? 'Reporting...' : 'Report'}
    </button>
  );
}
