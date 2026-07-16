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
              <div style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: property.status === 'AVAILABLE' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                {property.status === 'AVAILABLE' ? (
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
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Premium Amenities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>, text: "High-Speed Wi-Fi" },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>, text: "24/7 Security" },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>, text: "Secure Parking" },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>, text: "Fitness Center" },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>, text: "Pet Friendly" },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, text: "No Hidden Fees" }
              ].map((amenity, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-main)', fontSize: '1rem' }}>
                  <div style={{ color: 'var(--color-primary)' }}>{amenity.icon}</div>
                  {amenity.text}
                </div>
              ))}
            </div>
          </div>

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
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>85/100 (Excellent Transit)</span>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Walkability</strong>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Very Walkable neighborhood</span>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Nearby Places</strong>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Supermarkets, Cafes, Schools</span>
                </div>
              </div>
            </div>
          )}

        </div>

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
            {/* Contact Agent Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
                  {property.agent?.agencyName ? property.agent.agencyName.charAt(0) : 'A'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{property.agent?.agencyName || 'Platform Agent'}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Verified Agent</p>
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
            </div>

            {/* Mortgage / Rent Calculator */}
            <MortgageCalculator propertyPrice={property.price} />
          </div>
        </div>

      </div>
    </div>
  );
}
