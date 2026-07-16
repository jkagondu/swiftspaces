import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReviewForm from "@/components/ReviewForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agent = await prisma.user.findUnique({
    where: { id, role: "AGENT", agentStatus: "ACTIVE" },
    select: { agencyName: true }
  });

  if (!agent) return { title: "Agent Not Found | SwiftSpaces" };

  return {
    title: `${agent.agencyName || 'Independent Agent'} | SwiftSpaces`,
    description: `View properties listed by ${agent.agencyName || 'this agent'} on SwiftSpaces.`,
  };
}

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await prisma.user.findUnique({
    where: { id, role: "AGENT", agentStatus: "ACTIVE" },
    include: {
      properties: {
        orderBy: { createdAt: 'desc' }
      },
      reviews: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!agent) {
    notFound();
  }

  return (
    <div style={{ backgroundColor: 'var(--color-surface-secondary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Navbar Placeholder */}
      <nav className="navbar" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
        <div className="container nav-container">
          <Link href="/" className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            SwiftSpaces
          </Link>
          <div className="nav-links">
            <Link href="/properties" className="nav-link">Properties</Link>
            <Link href="/agents" className="nav-link text-primary" style={{ fontWeight: 600 }}>Agents</Link>
            <Link href="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Agent Header */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '4rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700, flexShrink: 0, border: '4px solid white', boxShadow: 'var(--shadow-md)' }}>
            {agent.agencyName ? agent.agencyName.charAt(0) : "A"}
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>{agent.agencyName || "Independent Agent"}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                {agent.email}
              </span>
              {agent.phoneNumber && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  {agent.phoneNumber}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href={`mailto:${agent.email}`} className="btn btn-primary">Contact Agent</a>
          </div>
        </div>
      </div>

      {/* Agent's Properties */}
      <div className="container" style={{ paddingTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Properties by {agent.agencyName || "Agent"}</h2>
        
        {agent.properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)' }}>
            This agent doesn't have any active properties at the moment.
          </div>
        ) : (
          <div className="property-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {agent.properties.map((property: any) => (
              <Link href={`/properties/${property.id}`} key={property.id} className="card property-card animate-fade-in" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '200px' }}>
                  <Image 
                    src={property.images && property.images.length > 0 ? property.images[0] : "/prop-modern.png"} 
                    alt={property.title} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, 
                    backgroundColor: (property.status === 'SOLD' || property.status === 'RENTED') ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                    color: (property.status === 'SOLD' || property.status === 'RENTED') ? 'white' : 'var(--color-text-main)' }}>
                    {(property.status === 'SOLD' || property.status === 'RENTED') ? 'TAKEN' : property.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{property.title}</h3>
                  <p className="text-muted" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {property.location}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {property.beds > 0 && <span><strong>{property.beds}</strong> Beds</span>}
                    <span><strong>{property.baths}</strong> Baths</span>
                  </div>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>{property.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Customer Reviews</h2>
            
            {(!agent.reviews || agent.reviews.length === 0) ? (
              <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                No reviews yet. Be the first to leave a review!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {agent.reviews.map((review: any) => (
                  <div key={review.id} style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{review.customerName}</span>
                      <span style={{ color: '#f59e0b', fontSize: '0.875rem' }}>
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ lineHeight: 1.6 }}>"{review.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <ReviewForm agentId={agent.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
