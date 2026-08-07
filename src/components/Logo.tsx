import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  invertText?: boolean;
}

export default function Logo({ className = "", width = 32, height = 32, invertText = false }: LogoProps) {
  const textColor = invertText ? 'white' : 'var(--color-navy)';
  const brandColor = 'var(--color-primary)';

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={width} height={height} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2L2 12V28L20 38L38 28V12L20 2Z" fill={brandColor} fillOpacity="0.1"/>
        <path d="M20 2L2 12V28L20 38L38 28V12L20 2Z" stroke={brandColor} strokeWidth="2"/>
        <path d="M20 8L8 15V25L20 32L32 25V15L20 8Z" fill={brandColor}/>
        <path d="M20 14L14 17.5V22.5L20 26L26 22.5V17.5L20 14Z" fill="white"/>
      </svg>
      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: textColor, letterSpacing: '-0.03em' }}>
        Swift<span style={{ color: brandColor }}>Spaces</span>
      </span>
    </div>
  );
}
