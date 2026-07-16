"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    id: 1,
    image: "/hero-slider-1.png",
    title: "Find Your Perfect Family Home",
    subtitle: "Discover premium real estate and spacious layouts designed for your lifestyle."
  },
  {
    id: 2,
    image: "/hero-slider-2.png",
    title: "Invest in Premium Vacant Plots & Acreage",
    subtitle: "Discover premium acreage and scenic building zones ready for development."
  },
  {
    id: 3,
    image: "/hero-slider-3.png",
    title: "Discover Modern Urban Living Spaces",
    subtitle: "Explore exclusive penthouses and modern luxury living in the heart of the city."
  },
  {
    id: 4,
    image: "/hero-slider-4.png",
    title: "Book Your Next Perfect Getaway",
    subtitle: "Browse highly-rated luxury Airbnbs and short-term vacation rentals."
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.set("location", searchLocation.trim());
    if (searchType && searchType !== "all") params.set("type", searchType);
    router.push(`/properties${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <section className="hero" style={{ 
      position: 'relative', 
      padding: '10rem 0 8rem 0',
      color: 'white',
      overflow: 'hidden',
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      {/* Background Images Layer */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: currentSlide === index ? 1 : 0,
            transition: 'opacity 0.7s ease-in-out',
            zIndex: 0
          }}
        >
          {/* Dark Overlay Gradient */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8))'
          }}></div>
        </div>
      ))}

      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
        
        {/* Dynamic Text Overlay */}
        <div style={{ height: '180px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {slides.map((slide, index) => (
            <div 
              key={`text-${slide.id}`}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: currentSlide === index ? 1 : 0,
                transition: 'opacity 0.7s ease-in-out',
                pointerEvents: currentSlide === index ? 'auto' : 'none',
                width: '100%',
                left: 0
              }}
            >
              <h1 className="hero-title" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '0.025em', color: 'white' }}>
                {slide.title}
              </h1>
              <p className="hero-subtitle" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontSize: '1.25rem', color: '#E2E8F0', maxWidth: '650px', margin: '0 auto' }}>
                {slide.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Search */}
        <div className="card" style={{ 
          width: '100%',
          maxWidth: '1200px', 
          margin: '3rem auto 0 auto', 
          padding: '1.5rem', 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          textAlign: 'left',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          borderRadius: '16px',
          animation: 'fadeInUp 1s ease 0.5s forwards',
          opacity: 0,
          transform: 'translateY(20px)'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#E2E8F0' }}>Location</label>
            <input
              id="hero-location-search"
              type="text"
              placeholder="Where do you want to live?"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '100%', height: '56px', padding: '0 1.25rem', boxSizing: 'border-box', borderRadius: '12px', border: 'none', outline: 'none', backgroundColor: 'rgba(255,255,255,0.95)', color: '#0f172a', fontSize: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#E2E8F0' }}>Property Type</label>
            <select
              id="hero-type-search"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ width: '100%', height: '56px', padding: '0 1.25rem', boxSizing: 'border-box', borderRadius: '12px', border: 'none', outline: 'none', backgroundColor: 'rgba(255,255,255,0.95)', color: '#0f172a', cursor: 'pointer', fontSize: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
            >
              <option value="">All Types</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="BEDSITTER">Bedsitter</option>
              <option value="SINGLE_ROOM">Single Room</option>
              <option value="AIRBNB">Airbnb / Short-Stay</option>
              <option value="LAND">Land / Plots</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              id="hero-search-btn"
              onClick={handleSearch}
              style={{ padding: '0 2.5rem', height: '56px', boxSizing: 'border-box', background: 'var(--color-primary)', color: 'white', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)', transition: 'background-color 0.2s, transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, zIndex: 2, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: currentSlide === index ? '32px' : '12px',
              height: '12px',
              borderRadius: '6px',
              background: currentSlide === index ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </section>
  );
}
