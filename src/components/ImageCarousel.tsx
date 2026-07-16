"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageCarousel({ images, status }: { images: string[], status: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div style={{ position: 'relative', height: '500px', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', backgroundColor: '#1e293b' }}>
      <Image 
        src={images[currentIndex]} 
        alt="Property Image" 
        fill 
        style={{ objectFit: 'cover' }}
        priority
      />
      
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '1.5rem',
        left: '1.5rem',
        background: 'var(--color-primary)',
        color: 'white',
        padding: '0.5rem 1.5rem',
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        boxShadow: 'var(--shadow-lg)'
      }}>
        {status.replace('_', ' ')}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button 
            onClick={handleNext}
            style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          {/* Dots */}
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
            {images.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                style={{ 
                  width: currentIndex === idx ? '24px' : '8px', 
                  height: '8px', 
                  borderRadius: '4px', 
                  background: currentIndex === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.6)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
