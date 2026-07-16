"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, Popup, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';
import Link from 'next/link';

interface AllPropertiesMapProps {
  properties: any[];
  externalHoveredId?: string | null;
  userLocation?: { lat: number, lng: number } | null;
}

export default function AllPropertiesMap({ properties, externalHoveredId, userLocation }: AllPropertiesMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  
  const activeHoveredId = externalHoveredId || localHoveredId;

  // Calculate center based on properties or default to Nairobi
  const initialViewState = useMemo(() => {
    const validProps = properties.filter(p => p.latitude && p.longitude);
    if (validProps.length === 0) {
      return { latitude: -1.2921, longitude: 36.8219, zoom: 11 };
    }
    
    // Average lat/lng for center
    const avgLat = validProps.reduce((sum, p) => sum + p.latitude, 0) / validProps.length;
    const avgLng = validProps.reduce((sum, p) => sum + p.longitude, 0) / validProps.length;
    
    return { latitude: avgLat, longitude: avgLng, zoom: 11 };
  }, [properties]);

  const [viewState, setViewState] = useState(initialViewState);

  // Automatically fly to user location when they click "Near Me"
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13,
        duration: 1500,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      });
    }
  }, [userLocation]);

  return (
    <div style={{ width: '100%', height: '600px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', zIndex: 0, position: 'relative', boxShadow: 'var(--shadow-md)' }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoidGVzdHVzZXIiLCJhIjoiY2p4a3h0Y2x6MG1mNzNzcjM2NGtmbnRkeiJ9.dummy_token"}
        style={{ width: '100%', height: '100%' }}
        scrollZoom={true} // Allow zoom on the big map
      >
        <FullscreenControl position="top-right" />
        <NavigationControl position="bottom-right" />
        
        {properties.map(property => {
          if (!property.latitude || !property.longitude) return null;
          
          const isSelected = popupInfo?.id === property.id;
          const isHovered = activeHoveredId === property.id;

          return (
            <Marker 
              key={property.id} 
              longitude={property.longitude} 
              latitude={property.latitude}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(property);
                mapRef.current?.flyTo({
                  center: [property.longitude, property.latitude],
                  zoom: 14,
                  duration: 1000
                });
              }}
            >
              <div 
                onMouseEnter={() => setLocalHoveredId(property.id)}
                onMouseLeave={() => setLocalHoveredId(null)}
                style={{ 
                  background: isSelected ? 'var(--color-navy)' : (isHovered ? 'var(--color-navy)' : 'var(--color-primary)'), 
                  color: 'white', 
                  padding: isSelected || isHovered ? '0.35rem 0.6rem' : '0.25rem 0.5rem', 
                  borderRadius: '12px', 
                  fontWeight: 800, 
                  fontSize: isSelected || isHovered ? '0.85rem' : '0.75rem',
                  cursor: 'pointer',
                  boxShadow: isSelected || isHovered ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.3)',
                  border: '2px solid white',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: isSelected || isHovered ? 'scale(1.1) translateY(-4px)' : 'scale(1) translateY(0)'
                }}
              >
                {property.price.split('/')[0]} {/* Show short price */}
              </div>
            </Marker>
          );
        })}

        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#3b82f6', border: '3px solid white', borderRadius: '50%', boxShadow: '0 0 15px rgba(59,130,246,0.8)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            </div>
          </Marker>
        )}

        {popupInfo && (
          <Popup
            anchor="bottom"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            offset={20}
            maxWidth="300px"
          >
            <div style={{ padding: '0.5rem', width: '220px' }}>
              <div style={{ width: '100%', height: '120px', position: 'relative', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <Image 
                  src={popupInfo.images && popupInfo.images.length > 0 ? popupInfo.images[0] : "/prop-modern.png"} 
                  alt={popupInfo.title} 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-navy)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {popupInfo.title}
              </h4>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {popupInfo.location}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem' }}>{popupInfo.price}</span>
                <Link href={`/properties/${popupInfo.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                  View
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
