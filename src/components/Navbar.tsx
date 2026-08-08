'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className="navbar" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        backgroundColor: scrolled ? 'rgba(2, 6, 23, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: scrolled ? '0.5rem 0' : '1rem 0'
      }}
    >
      <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo width={40} height={40} invertText={true} />
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link nav-link-light">Home</Link>
          <Link href="/properties" className="nav-link nav-link-light">Properties</Link>
          <Link href="/agents" className="nav-link nav-link-light">Agents</Link>
          <Link href="/saved" className="nav-link nav-link-light">❤️ Saved</Link>
          <Link href="/manager" className="nav-link nav-link-light">Manager Portal</Link>
          <Link href="/admin" className="nav-link nav-link-light">Admin Portal</Link>
        </div>
      </div>
    </nav>
  );
}
