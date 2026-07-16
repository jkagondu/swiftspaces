import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  invertText?: boolean;
}

export default function Logo({ className = "", width = 32, height = 32, invertText = false }: LogoProps) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0px 4px 8px rgba(16, 185, 129, 0.4))' }}
      >
        <defs>
          <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="logoGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        
        {/* Abstract Isometric Building Blocks */}
        {/* Left Block */}
        <path d="M50 20 L25 35 L25 65 L50 80 L50 20Z" fill="url(#logoGradient1)" opacity="0.9" />
        
        {/* Right Block */}
        <path d="M50 40 L75 25 L75 55 L50 70 L50 40Z" fill="url(#logoGradient2)" opacity="0.85" />
        
        {/* Center / Front Face Details to give depth */}
        <path d="M50 20 L25 35 L50 50 L75 35 Z" fill="rgba(255, 255, 255, 0.2)" />
        <path d="M50 40 L75 25 L50 10 L25 25 Z" fill="rgba(255, 255, 255, 0.15)" />
        
        {/* Accents */}
        <circle cx="50" cy="50" r="4" fill="white" />
      </svg>
      <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: invertText ? 'white' : 'var(--color-text-main)', lineHeight: 1, marginTop: '4px' }}>
        Swift<span style={{ color: 'var(--color-primary)' }}>Spaces</span>
      </span>
    </div>
  );
}
