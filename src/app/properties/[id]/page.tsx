import Image from "next/image";
import Link from "next/link";
import PropertyMap from "@/components/PropertyMap";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImageCarousel from "@/components/ImageCarousel";
import InquiryForm from "@/components/InquiryForm";
import MortgageCalculator from "@/components/MortgageCalculator";
import SavePropertyButton from "@/components/SavePropertyButton";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    select: { title: true, description: true, price: true, images: true }
  });

  if (!property) return { title: "Property Not Found | SwiftSpaces" };

  return {
    title: `${property.title} - ${property.price} | SwiftSpaces`,
    description: property.description.substring(0, 160) + "...",
    openGraph: {
      title: `${property.title} for ${property.price}`,
      description: property.description.substring(0, 160) + "...",
      images: property.images && property.images.length > 0 ? [{ url: property.images[0] }] : [],
    },
  };
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Fetch real data from the Database!
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      agent: true,
    }
  });

  if (!property) {
    notFound();
  }

  // Increment views
  await prisma.property.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

  // Use the multiple images array, or fallback to a placeholder
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["/prop-2bed.png"];

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--color-surface-secondary)' }}>
      {/* Navbar */}
      <nav className="navbar" style={{ background: 'white', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container nav-container">
          <Link href="/" className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            SwiftSpaces
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/properties" className="nav-link text-primary">Properties</Link>
            <Link href="/agents" className="nav-link">Agents</Link>
            <Link href="/saved" className="nav-link">❤️ Saved</Link>
            <Link href="/manager" className="nav-link">Manager Portal</Link>
            <Link href="/admin" className="nav-link">Admin Portal</Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="container" style={{ padding: '2rem 1.5rem 0' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Link href="/properties" style={{ textDecoration: 'underline' }}>Properties</Link> / {property.type} / <span style={{ color: 'var(--color-text-main)' }}>{property.title}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <h1 className="heading-2" style={{ flex: 1 }}>{property.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{property.price}</div>
                <SavePropertyButton
                  property={{
                    id: property.id,
                    title: property.title,
                    price: property.price,
                    location: property.location,
                    images: property.images,
                    beds: property.beds,
                    baths: property.baths,
                  }}
                  size="md"
                  showLabel={true}
                />
              </div>
            </div>
            <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {property.location}
            </p>
          </div>

          {/* Image Carousel Component */}
          <ImageCarousel images={images} status={property.status} />

          {(property.virtualTourUrl || property.videoUrl) && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '-1rem' }}>
              {property.virtualTourUrl && (
                <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"></path></svg>
                  View 3D Tour
                </a>
              )}
              {property.videoUrl && (
                <a href={property.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  Watch Video
                </a>
              )}
            </div>
          )}

          {/* Property Features */}
          <div className="card" style={{ padding: '2rem', display: 'flex', gap: '3rem', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Bedrooms</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
                {property.beds}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Bathrooms</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9 22h6"></path><path d="M12 18v4"></path><path d="M7 2.5a2.12 2.12 0 0 0-3 3"></path><path d="M12 2.5a2.12 2.12 0 0 0-3 3"></path><path d="M17 2.5a2.12 2.12 0 0 0-3 3"></path><path d="M3 18h18v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4z"></path></svg>
                {property.baths}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Property Type</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                {property.type.toLowerCase().replace('_', ' ')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Status</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: (property.status === 'FOR_RENT' || property.status === 'FOR_SALE' || property.status === 'SHORT_TERM') ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                {(property.status === 'FOR_RENT' || property.status === 'FOR_SALE' || property.status === 'SHORT_TERM') ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                )}
                {property.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About this property</h2>
            <p style={{ lineHeight: 1.8, color: 'var(--color-text-main)', whiteSpace: 'pre-wrap' }}>
              {property.description}
            </p>
          </div>

          {/* Premium Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Premium Amenities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-main)', fontSize: '1rem' }}>
                    <div style={{ color: 'var(--color-primary)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Location */}
          {property.latitude && property.longitude && (
            <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '4rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '2rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Neighborhood & Location</h2>
                <p style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {property.location} — Explore the interactive map below
                </p>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '450px' }}>
                <PropertyMap latitude={property.latitude} longitude={property.longitude} zoom={13} interactive={true} />
              </div>
              <div style={{ padding: '1.5rem 2rem', background: 'var(--color-surface-secondary)', display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Transit Score</strong>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{property.transitScore || "Not specified"}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Walkability</strong>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{property.walkability || "Not specified"}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Nearby Places</strong>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{property.nearbyPlaces || "Not specified"}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
            {/* Contact Agent Card */}
            <div className="card" style={{ padding: '2rem', position: 'relative' }}>
              <button 
                onClick={() => alert("Report has been submitted to the SwiftSpaces Admin team for investigation.")}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Report this listing as a scam"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                Report
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
                  {property.agent?.agencyName ? property.agent.agencyName.charAt(0) : 'A'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {property.agent?.agencyName || 'Platform Agent'}
                    {property.agent?.isVerified && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#38bdf8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="Verified Agent"><polygon points="12 2 15.09 5.09 19.5 4.5 21 8.91 24 12 21 15.09 19.5 19.5 15.09 18.91 12 22 8.91 18.91 4.5 19.5 3 15.09 0 12 3 8.91 4.5 4.5 8.91 5.09 12 2"></polygon><polyline points="9 12 11 14 15 10"></polyline></svg>
                    )}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: property.agent?.isVerified ? '#38bdf8' : 'var(--color-text-muted)' }}>
                    {property.agent?.isVerified ? 'Verified Agent' : 'Standard Agent'}
                  </p>
                  {property.agent?.id && (
                    <Link href={`/agents/${property.agent.id}`} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'underline' }}>View Profile →</Link>
                  )}
                </div>
              </div>

              <h4 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Contact Agent</h4>
              <InquiryForm propertyId={property.id} />

              {property.agent?.phoneNumber && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <a href={`tel:${property.agent.phoneNumber}`} className="btn btn-outline" style={{ padding: '1rem', width: '100%', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Call Agent
                  </a>
                </div>
              )}

              {/* Anti-Scam Safety Banner */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <div>
                  <h5 style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Safety Warning</h5>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
                    Never pay a viewing fee or send money via M-Pesa before physically inspecting this property and signing legal documents. SwiftSpaces is not responsible for off-platform transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Mortgage / Rent Calculator */}
            <MortgageCalculator propertyPrice={property.price} />
          </div>
        </div>

      </div>
    </div>
  );
}
