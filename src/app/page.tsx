import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import HeroSlider from "@/components/HeroSlider";
import Logo from "@/components/Logo";

export default async function Home() {
  // Fetch latest 3 properties dynamically from the database
  const featuredProperties = await prisma.property.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Navbar */}
      <nav className="navbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div className="container nav-container">
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

      {/* Dynamic Hero Slider */}
      <HeroSlider />

      {/* 1. Quick Category Shortcuts */}
      <section style={{ backgroundColor: 'var(--color-surface-secondary)', padding: '4rem 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <Link href="/properties?type=house" className="category-card">
              <div style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem auto', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <h3 style={{ color: 'var(--color-text-main)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Vacant Houses</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Find your perfect family home.</p>
            </Link>

            <Link href="/properties?type=land" className="category-card">
              <div style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem auto', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"></path><path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2h3.17"></path><path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2h-1.52"></path><circle cx="12" cy="12" r="10"></circle></svg>
              </div>
              <h3 style={{ color: 'var(--color-text-main)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Land & Plots</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Secure a plot for your future.</p>
            </Link>

            <Link href="/properties?type=commercial" className="category-card">
              <div style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem auto', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              </div>
              <h3 style={{ color: 'var(--color-text-main)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Commercial Spaces</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Prime locations for your business.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties (Dynamic from DB) */}
      <section className="container" style={{ paddingTop: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 className="heading-2" style={{ marginBottom: '0.5rem' }}>Latest Premium Listings</h2>
            <p className="text-muted">Handpicked properties directly from verified agents.</p>
          </div>
          <Link href="/properties" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            View All
          </Link>
        </div>

        {featuredProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            No featured properties yet. Check back soon!
          </div>
        ) : (
          <div className="property-grid">
            {featuredProperties.map((property: any) => (
              <Link href={`/properties/${property.id}`} key={property.id} className="card property-card animate-fade-in" style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <div className="property-image">
                  <Image 
                    src={property.images && property.images.length > 0 ? property.images[0] : "/prop-modern.png"} 
                    alt={property.title} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                  />
                  <div className="property-badge">{property.status.replace('_', ' ')}</div>
                </div>
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{property.title}</h3>
                  <p className="text-muted" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {property.location}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                    {property.beds > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path></svg> <strong>{property.beds}</strong></span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 22h6"></path><path d="M12 18v4"></path><path d="M3 18h18v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4z"></path></svg> <strong>{property.baths}</strong></span>
                  </div>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>{property.price}</span>
                    <span className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-surface-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="heading-2" style={{ color: 'var(--color-navy)' }}>What Our Clients Say</h2>
            <p className="text-muted" style={{ fontSize: '1.125rem', marginTop: '0.5rem' }}>Don't just take our word for it.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {[
              { name: "Sarah Jenkins", role: "First-time Buyer", text: "SwiftSpaces made finding our first home an absolute breeze. The direct contact with verified agents gave us peace of mind." },
              { name: "Michael O.", role: "Property Investor", text: "The premium listings and transparent pricing help me make quick investment decisions. Highly recommended platform." },
              { name: "Elena R.", role: "Renter", text: "I found an amazing urban apartment within days. The map view and advanced filters are game changers." }
            ].map((testimonial, i) => (
              <div key={i} className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid var(--color-primary)', position: 'relative' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-primary-light)" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.5 }}><path d="M14.017 18L14.017 14.9231C14.017 12.0354 15.6881 10.3341 18.0673 10.0101L18.0673 12.0163C16.8962 12.1933 16.299 12.9837 16.299 14.2885L16.299 14.8846L19.9808 14.8846L19.9808 18L14.017 18ZM4 18L4 14.9231C4 12.0354 5.67115 10.3341 8.05032 10.0101L8.05032 12.0163C6.87917 12.1933 6.28199 12.9837 6.28199 14.2885L6.28199 14.8846L9.96378 14.8846L9.96378 18L4 18Z"></path></svg>
                <div style={{ color: 'var(--color-primary)', display: 'flex', gap: '0.25rem', zIndex: 1 }}>
                  {[...Array(5)].map((_, i) => <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>)}
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-main)', flex: 1, fontSize: '1.125rem', lineHeight: 1.6, zIndex: 1 }}>"{testimonial.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, margin: 0, color: 'var(--color-navy)' }}>{testimonial.name}</h4>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-primary)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '200%', background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)', transform: 'rotate(15deg)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 className="display-2" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Join the Inner Circle</h2>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>Get exclusive access to premium listings and market insights before they hit the general market.</p>
          </div>
          <div style={{ flex: '1 1 400px', display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
            <input type="email" placeholder="Enter your email address" style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '8px', border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'var(--color-text-main)', fontSize: '1rem' }} />
            <button className="btn" style={{ padding: '0 2.5rem', borderRadius: '8px', fontWeight: 600, backgroundColor: 'var(--color-navy)', color: 'white' }}>Subscribe</button>
          </div>
        </div>
      </section>

      {/* 3. Trust / Value Footer */}
      <section style={{ backgroundColor: 'var(--color-navy)', color: 'white', padding: '6rem 0', marginTop: '6rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 className="display-2" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Why Choose SwiftSpaces?</h2>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '3rem', lineHeight: 1.6 }}>
            We connect you directly with verified agents and premium property listings. No middlemen, no hidden fees. Experience a transparent, fast, and secure real estate marketplace.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem', borderRadius: '12px' }}>
              Post Your Property
            </Link>
            <Link href="/agents" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.125rem', borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              Find an Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
