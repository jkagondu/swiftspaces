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
            style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <div className="property-image">
              <Image 
                src={property.images && property.images.length > 0 ? property.images[0] : "/prop-modern.png"} 
                alt={property.title} 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div className="property-badge">{property.status.replace('_', ' ')}</div>
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
              
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-main)', marginTop: '0.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                {property.beds > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path></svg> 
                    <strong>{property.beds} Beds</strong>
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 22h6"></path><path d="M12 18v4"></path><path d="M3 18h18v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4z"></path></svg> 
                  <strong>{property.baths} Baths</strong>
                </span>
              </div>
              
              <div style={{ marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)' }}>{property.price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
