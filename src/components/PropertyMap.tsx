"use client";

import { useState } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
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

  return (
    <div style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', zIndex: 0, position: 'relative' }}>
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
        <Marker longitude={longitude} latitude={latitude} color="var(--color-primary)" />
      </Map>
    </div>
  );
}
