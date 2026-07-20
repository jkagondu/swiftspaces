"use client";

import { useState } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  interactive?: boolean;
}

export default function PropertyMap({ latitude, longitude, zoom = 12, interactive = true }: PropertyMapProps) {
  const [viewState, setViewState] = useState({
    latitude,
    longitude,
    zoom
  });
  
  const [routeData, setRouteData] = useState<any>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleGetDirections = () => {
    setIsCalculating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsCalculating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setUserLoc({ lat: uLat, lng: uLng });

        try {
          const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoidGVzdHVzZXIiLCJhIjoiY2p4a3h0Y2x6MG1mNzNzcjM2NGtmbnRkeiJ9.dummy_token";
          const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${uLng},${uLat};${longitude},${latitude}?geometries=geojson&access_token=${mapboxToken}`);
          if (res.ok) {
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
              const route = data.routes[0];
              setRouteData(route.geometry);
              const mins = Math.round(route.duration / 60);
              const distanceKm = (route.distance / 1000).toFixed(1);
              setEta(`${mins} min driving (${distanceKm} km)`);
              
              // Adjust view to fit both points (rough approximation)
              setViewState({
                latitude: (uLat + latitude) / 2,
                longitude: (uLng + longitude) / 2,
                zoom: 11
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch directions", error);
        } finally {
          setIsCalculating(false);
        }
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Could not get your location. Please check permissions.");
        setIsCalculating(false);
      }
    );
  };

  return (
    <div style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', zIndex: 0, position: 'relative' }}>
      
      {/* Directions Overlay */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'white', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!routeData ? (
          <button 
            onClick={handleGetDirections} 
            disabled={isCalculating}
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isCalculating ? "Calculating..." : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                Get Directions
              </>
            )}
          </button>
        ) : (
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)' }}>ETA: {eta}</div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'underline', marginTop: '4px', display: 'block' }}
            >
              Open in Google Maps
            </a>
          </div>
        )}
      </div>

      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoidGVzdHVzZXIiLCJhIjoiY2p4a3h0Y2x6MG1mNzNzcjM2NGtmbnRkeiJ9.dummy_token"}
        style={{ width: '100%', height: '100%' }}
        scrollZoom={false} // Prevents getting trapped in the map when scrolling the page
        dragPan={interactive}
      >
        <FullscreenControl position="top-right" />
        <NavigationControl position="bottom-right" />
        
        {/* Destination Marker */}
        <Marker longitude={longitude} latitude={latitude} color="var(--color-primary)" />
        
        {/* User Location Marker */}
        {userLoc && (
          <Marker longitude={userLoc.lng} latitude={userLoc.lat}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#3b82f6', border: '3px solid white', borderRadius: '50%', boxShadow: '0 0 10px rgba(59,130,246,0.8)' }} />
          </Marker>
        )}

        {/* Route Line */}
        {routeData && (
          <Source id="route" type="geojson" data={{ type: 'Feature', properties: {}, geometry: routeData }}>
            <Layer 
              id="route-line" 
              type="line" 
              source="route" 
              layout={{ 'line-join': 'round', 'line-cap': 'round' }} 
              paint={{ 'line-color': '#10b981', 'line-width': 5, 'line-opacity': 0.8 }} 
            />
          </Source>
        )}
      </Map>
    </div>
  );
}
