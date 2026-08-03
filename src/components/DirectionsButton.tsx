"use client";

import React from 'react';

export default function DirectionsButton({ latitude, longitude }: { latitude: number | string, longitude: number | string }) {
  if (!latitude || !longitude) return null;

  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const originLat = position.coords.latitude;
          const originLng = position.coords.longitude;
          window.open(`https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${latitude},${longitude}`, '_blank');
        },
        () => {
          // Fallback if denied
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
        },
        { timeout: 5000 }
      );
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    }
  };

  return (
    <button 
      onClick={handleDirections}
      style={{ 
        padding: '0.35rem 0.65rem', 
        fontSize: '0.75rem', 
        fontWeight: 600, 
        borderRadius: '6px', 
        background: 'rgba(16, 185, 129, 0.1)', 
        color: 'var(--color-primary)', 
        border: '1px solid rgba(16, 185, 129, 0.2)', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.35rem', 
        transition: 'all 0.2s' 
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
      Directions
    </button>
  );
}
