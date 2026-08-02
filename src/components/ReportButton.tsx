"use client";

import React from "react";

export default function ReportButton() {
  return (
    <button 
      onClick={() => alert("Report has been submitted to the SwiftSpaces Admin team for investigation.")}
      style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      title="Report this listing as a scam"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
      Report
    </button>
  );
}
