import Image from "next/image";
import Link from "next/link";
import DirectionsButton from "@/components/DirectionsButton";
import prisma from "@/lib/prisma";
import HeroSlider from "@/components/HeroSlider";
import Logo from "@/components/Logo";
import Navbar from "@/components/Navbar";
import NewsletterForm from "@/components/NewsletterForm";

export const revalidate = 60; // Revalidate every 60 seconds
import CompareCheckbox from "@/components/CompareCheckbox";
import AutoScrollingCarousel from "@/components/AutoScrollingCarousel";

export default async function Home() {
  // Fetch properties, ensuring featured properties appear first
  const featuredProperties = await prisma.property.findMany({
    orderBy: [
      { isFeatured: 'desc' },
      { createdAt: 'desc' }
    ],
  });

  // Fetch latest 3 reviews
  const latestReviews = await prisma.review.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      agent: {
        select: { agencyName: true }
      }
    }
  });

  const reviewsToDisplay = latestReviews;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Dynamic Sticky Navbar */}
      <Navbar />

      {/* Dynamic Hero Slider */}
      <HeroSlider />

      {/* 1. Quick Category Shortcuts */}
      <section style={{ backgroundColor: 'var(--color-surface-secondary)', padding: '4rem 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <Link href="/properties" className="category-card">
              <div style={{ width: '48px', height: '48px', flexShrink: 0, background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <div>
                <h3 style={{ color: 'var(--color-navy)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Vacant Houses</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Find your perfect family home.</p>
              </div>
            </Link>

            <Link href="/properties" className="category-card">
              <div style={{ width: '48px', height: '48px', flexShrink: 0, background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"></path><path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2h3.17"></path><path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2h-1.52"></path><circle cx="12" cy="12" r="10"></circle></svg>
              </div>
              <div>
                <h3 style={{ color: 'var(--color-navy)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Land & Plots</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Secure a plot for your future.</p>
              </div>
            </Link>

            <Link href="/properties" className="category-card">
              <div style={{ width: '48px', height: '48px', flexShrink: 0, background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              </div>
              <div>
                <h3 style={{ color: 'var(--color-navy)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Commercial Spaces</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Prime locations for your business.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties (Dynamic from DB) */}
      <section className="container" style={{ paddingTop: '6rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: '1 1 250px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Featured Properties</span>
            <h2 className="heading-2" style={{ margin: '0.25rem 0', fontSize: '2rem', color: 'var(--color-navy)' }}>Explore Our Exclusive Properties</h2>
          </div>
          <Link href="/properties" className="btn btn-outline" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
            View All
          </Link>
        </div>

        {featuredProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            No featured properties yet. Check back soon!
          </div>
        ) : (
          <AutoScrollingCarousel properties={featuredProperties} />
        )}
      </section>

      {/* Testimonials */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-surface-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="heading-2" style={{ color: 'var(--color-navy)' }}>What Our Clients Say</h2>
            <p className="text-muted" style={{ fontSize: '1.125rem', marginTop: '0.5rem' }}>Don't just take our word for it.</p>
          </div>
          {reviewsToDisplay.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
              No reviews available yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
              {reviewsToDisplay.map((review: any, i) => (
                <div key={i} className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid var(--color-primary)', position: 'relative' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-primary-light)" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.5 }}><path d="M14.017 18L14.017 14.9231C14.017 12.0354 15.6881 10.3341 18.0673 10.0101L18.0673 12.0163C16.8962 12.1933 16.299 12.9837 16.299 14.2885L16.299 14.8846L19.9808 14.8846L19.9808 18L14.017 18ZM4 18L4 14.9231C4 12.0354 5.67115 10.3341 8.05032 10.0101L8.05032 12.0163C6.87917 12.1933 6.28199 12.9837 6.28199 14.2885L6.28199 14.8846L9.96378 14.8846L9.96378 18L4 18Z"></path></svg>
                  <div style={{ color: 'var(--color-primary)', display: 'flex', gap: '0.25rem', zIndex: 1 }}>
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="20" height="20" viewBox="0 0 24 24" fill={j < review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={j < review.rating ? "0" : "2"}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                      </svg>
                    ))}
                  </div>
                  <p style={{ fontStyle: 'italic', color: 'var(--color-text-main)', flex: 1, fontSize: '1.125rem', lineHeight: 1.6, zIndex: 1 }}>"{review.comment}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                      {review.customerName ? review.customerName.charAt(0) : "U"}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, margin: 0, color: 'var(--color-navy)' }}>{review.customerName}</h4>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        {review.agent?.agencyName ? `Reviewed Agent: ${review.agent.agencyName}` : "Customer"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
