import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  invertText?: boolean;
}

export default function Logo({ className = "", width = 32, height = 32, invertText = false }: LogoProps) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '0.25rem 0.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Image 
        src="/logo-concept-final.png" 
        alt="SwiftSpaces Logo" 
        width={120} 
        height={40}
        style={{ objectFit: 'contain', width: 'auto', height: `${height}px` }}
        priority
      />
    </div>
  );
}
