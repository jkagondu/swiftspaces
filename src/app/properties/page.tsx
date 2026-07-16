"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import AllPropertiesMap from "@/components/AllPropertiesMap";

export default function PropertiesPage() {
  const [locationQuery, setLocationQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("");
  const [beds, setBeds] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState("list");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const loc = params.get("location");
      const type = params.get("type");
      if (loc) setLocationQuery(loc);
      if (type) setPropertyType(type);
    }
  }, []);

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleFindNearMe = () => {
    if (isNearbyMode) {
      setIsNearbyMode(false);
      setUserLocation(null);
      return;
    }
    
    setIsLocating(true);
    
    const fallbackToNairobi = () => {
      console.log("Using fallback location (Nairobi)");
      setUserLocation({ lat: -1.2921, lng: 36.8219 });
      setIsNearbyMode(true);
      setIsLocating(false);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsNearbyMode(true);
          setIsLocating(false);
        },
        (error) => {
          console.log("Geolocation error/denied. Using fallback for demo.");
          fallbackToNairobi();
        },
        { timeout: 5000 }
      );
    } else {
      fallbackToNairobi();
    }
  };

  useEffect(() => {
    async function fetchProperties() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        }
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((prop) => {
    const matchesLocation = prop.location.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesType = propertyType === "all" || prop.type.toLowerCase() === propertyType.replace('-', '_');
    
    let matchesPrice = true;
    if (priceRange) {
      if (priceRange === "under_10m") matchesPrice = !prop.price.includes("15") && !prop.price.includes("20") && !prop.price.includes("25") && !prop.price.includes("65");
      else if (priceRange === "10m_20m") matchesPrice = prop.price.includes("15") || prop.price.includes("12") || prop.price.includes("18");
      else if (priceRange === "over_20m") matchesPrice = prop.price.includes("25") || prop.price.includes("30") || prop.price.includes("50") || prop.price.includes("65");
    }
    
    let matchesBeds = true;
    if (beds) {
      matchesBeds = prop.beds >= parseInt(beds);
    }
    
    // Near Me Logic
    let matchesDistance = true;
    let distance = 0;
    if (isNearbyMode && userLocation && prop.latitude && prop.longitude) {
      distance = calculateDistance(userLocation.lat, userLocation.lng, prop.latitude, prop.longitude);
      prop.distance = distance; // temporarily store distance on the object for sorting/display
      matchesDistance = distance <= 15; // Within 15km
    } else if (isNearbyMode) {
      // If nearby mode is on but property has no coords, hide it
      matchesDistance = false;
    }
    
    return matchesLocation && matchesType && matchesPrice && matchesBeds && matchesDistance;
  });

  // Sort by distance if nearby mode is active
  if (isNearbyMode) {
    filteredProperties.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-outfit)', backgroundColor: 'var(--color-surface-secondary)', paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container nav-container" style={{ maxWidth: 'none', padding: '0 2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo width={36} height={36} />
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link" style={{ color: 'var(--color-text-main)' }}>Home</Link>
            <Link href="/properties" className="nav-link" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Properties</Link>
            <Link href="/agents" className="nav-link" style={{ color: 'var(--color-text-main)' }}>Agents</Link>
            <Link href="/saved" className="nav-link" style={{ color: 'var(--color-text-main)' }}>❤️ Saved</Link>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Split Screen Container */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 80px)', overflow: 'hidden', position: 'relative' }}>
        
        {/* Left Scrollable Panel */}
        <div className={mobileView === 'map' ? 'hide-on-mobile' : ''} style={{ flex: '1 1 50%', maxWidth: '900px', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--color-surface-secondary)' }}>
          
          {/* Dark Header inside the split panel */}
          <div style={{ background: '#0F172A', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h1 className="heading-2" style={{ fontSize: '2.5rem', margin: 0, color: 'white' }}>Discover Properties</h1>
              <p style={{ color: '#94a3b8' }}>Find exactly what you're looking for with our interactive map and filters.</p>
            </div>

            {/* Filters inline (Dark Mode Styled) */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search location..." 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                style={{ flex: '1 1 150px', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
              />
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                style={{ flex: '1 1 120px', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="all" style={{ color: 'black' }}>All Types</option>
                <option value="house" style={{ color: 'black' }}>House</option>
                <option value="apartment" style={{ color: 'black' }}>Apartment</option>
                <option value="single" style={{ color: 'black' }}>Single Room</option>
                <option value="bedsitter" style={{ color: 'black' }}>Bedsitter</option>
                <option value="airbnb" style={{ color: 'black' }}>Airbnb</option>
                <option value="land" style={{ color: 'black' }}>Land</option>
              </select>
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} style={{ flex: '1 1 120px', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="" style={{ color: 'black' }}>Any Price</option>
                <option value="under_10m" style={{ color: 'black' }}>Under KES 10M</option>
                <option value="10m_20m" style={{ color: 'black' }}>KES 10M - 20M</option>
                <option value="over_20m" style={{ color: 'black' }}>Over KES 20M</option>
              </select>
              <button 
                onClick={handleFindNearMe}
                style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: isNearbyMode ? 'var(--color-primary)' : 'transparent', color: isNearbyMode ? 'white' : 'var(--color-primary)', border: '1px solid var(--color-primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                {isLocating ? <div style={{ width: '16px', height: '16px', border: '2px solid', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>}
                {isNearbyMode ? "Turn Off Near Me" : "Near Me"}
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem 2rem 0 2rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isLoading ? "Searching properties..." : `${filteredProperties.length} Properties Found`}
          </div>

          <div style={{ padding: '1.5rem 2rem 4rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', height: '380px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: '180px', width: '100%', borderRadius: '0' }}></div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ height: '28px', width: '40%' }}></div>
                    <div className="skeleton" style={{ height: '20px', width: '85%' }}></div>
                    <div className="skeleton" style={{ height: '16px', width: '60%' }}></div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                      <div className="skeleton" style={{ height: '16px', width: '20%' }}></div>
                      <div className="skeleton" style={{ height: '16px', width: '20%' }}></div>
                      <div className="skeleton" style={{ height: '16px', width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredProperties.length > 0 ? (
              filteredProperties.map((property: any) => (
                <Link href={`/properties/${property.id}`} key={property.id} className="animate-fade-in card" style={{ 
                  display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden',
                  boxShadow: hoveredPropertyId === property.id ? 'var(--shadow-xl)' : 'var(--shadow-sm)',
                  transform: hoveredPropertyId === property.id ? 'translateY(-4px)' : 'none',
                  borderColor: hoveredPropertyId === property.id ? 'var(--color-primary)' : 'var(--color-border)'
                }}
                onMouseEnter={() => setHoveredPropertyId(property.id)}
                onMouseLeave={() => setHoveredPropertyId(null)}
                >
                  <div style={{ position: 'relative', height: '180px', width: '100%' }}>
                    <Image 
                      src={property.images && property.images.length > 0 ? property.images[0] : "/prop-modern.png"} 
                      alt={property.title} fill style={{ objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: (property.status === 'SOLD' || property.status === 'RENTED') ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                      {(property.status === 'SOLD' || property.status === 'RENTED') ? 'TAKEN' : property.status.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>{property.price.split('/')[0]}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.title}</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {property.location}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-main)', marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                      {property.beds > 0 && <span><strong>{property.beds}</strong> bd</span>}
                      <span><strong>{property.baths}</strong> ba</span>
                      {property.type && <span style={{ textTransform: 'capitalize' }}>{property.type.toLowerCase().replace('_', ' ')}</span>}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              !isLoading && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>No Properties Found</h3>
                  <p>Try adjusting your search filters or map location.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Map Panel */}
        <div className={mobileView === 'list' ? 'hide-on-mobile' : ''} style={{ flex: '1 1 50%', position: 'relative', borderLeft: '1px solid var(--color-border)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
             <AllPropertiesMap 
               properties={filteredProperties} 
               externalHoveredId={hoveredPropertyId} 
               userLocation={userLocation} 
             />
          </div>
        </div>

        {/* Floating Mobile Toggle */}
        <div className="hide-on-desktop" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <button 
            onClick={() => setMobileView(v => v === 'list' ? 'map' : 'list')} 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)', padding: '0.75rem 2rem', fontWeight: 700 }}
          >
            {mobileView === 'list' ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                Show Map
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Show List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
