"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageCarousel({ images, categorizedImages, status }: { images: string[], categorizedImages?: any, status: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

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
      
      {/* Status Badge & Overlay */}
      {(status === 'SOLD' || status === 'RENTED') ? (
        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ backgroundColor: '#ef4444', color: 'white', border: '4px solid white', padding: '1.5rem 4rem', fontSize: '3rem', fontWeight: 900, transform: 'rotate(-15deg)', letterSpacing: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
            HOUSE TAKEN
          </div>
        </div>
      ) : (
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
          {(status || "").replace('_', ' ')}
        </div>
      )}

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
          <button 
            onClick={() => setShowGallery(true)}
            style={{ 
              position: 'absolute', 
              bottom: '1.5rem', 
              right: '1.5rem', 
              background: 'white', 
              color: 'var(--color-navy)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '8px', 
              padding: '0.5rem 1rem', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Show all photos
          </button>
        </>
      )}

      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'white',
          zIndex: 9999,
          overflowY: 'auto',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'sticky', top: 0, backgroundColor: 'white', padding: '1rem 0', zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Property Gallery</h2>
              <button 
                onClick={() => setShowGallery(false)}
                style={{ 
                  background: 'var(--color-surface-secondary)', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '40px', height: '40px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer' 
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            
            {/* Category Tabs */}
            {categorizedImages && Object.keys(categorizedImages).length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                <button 
                  onClick={() => setActiveCategory("All")}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', background: activeCategory === "All" ? 'var(--color-primary)' : 'white', color: activeCategory === "All" ? 'white' : 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  All
                </button>
                {Object.keys(categorizedImages).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', background: activeCategory === cat ? 'var(--color-primary)' : 'white', color: activeCategory === cat ? 'white' : 'var(--color-text-main)', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', gridAutoRows: '300px' }}>
              {(activeCategory === "All" ? images : (categorizedImages[activeCategory] || [])).map((img: string, idx: number) => (
                <div key={`${activeCategory}-${idx}`} style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                  <Image 
                    src={img} 
                    alt={`Property view ${idx + 1}`} 
                    fill 
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
