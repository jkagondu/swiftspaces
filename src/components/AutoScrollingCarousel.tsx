"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CompareCheckbox from '@/components/CompareCheckbox';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  status: string;
  beds: number;
  baths: number;
  images: string[];
}

interface AutoScrollingCarouselProps {
  properties: Property[];
}

export default function AutoScrollingCarousel({ properties }: AutoScrollingCarouselProps) {
  // We duplicate the properties array to create a seamless infinite loop
  const duplicatedProperties = [...properties, ...properties, ...properties];
  
  return (
    <div className="carousel-container">
      <div className="carousel-track">
        {duplicatedProperties.map((property, index) => (
          <Link 
            href={`/properties/${property.id}`} 
            key={`${property.id}-${index}`} 
            className="card property-card animate-fade-in carousel-item" 
            style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', position: 'relative' }}
          >
            <div className="property-image" style={{ overflow: 'hidden' }}>
              <Image 
                src={property.images && property.images.length > 0 ? property.images[0] : "/prop-modern.png"} 
                alt={property.title} 
                fill 
                style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                className="hover-zoom"
              />
              <div className="property-badge">{property.status.replace('_', ' ')}</div>
              
              {/* Solid Branded Price Tag */}
              <div style={{ 
                position: 'absolute', bottom: '10px', left: '10px', zIndex: 10,
                backgroundColor: 'var(--color-primary)', 
                padding: '0.4rem 0.75rem', borderRadius: '12px', fontWeight: 800, color: 'white',
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)', fontSize: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {property.price.split('/')[0]}
              </div>

              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                <CompareCheckbox propertyId={property.id} />
              </div>
            </div>
            
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, textTransform: 'capitalize', color: 'var(--color-navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {property.title}
              </h3>
              
              <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0, fontSize: '0.8rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.location}</span>
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                {property.beds > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-primary-light)', color: '#065F46', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path></svg> 
                    {property.beds} Beds
                  </span>
                )}
                {property.baths > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-primary-light)', color: '#065F46', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 22h6"></path><path d="M12 18v4"></path><path d="M3 18h18v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4z"></path></svg> 
                    {property.baths} Baths
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
