import prisma from "@/lib/prisma";
import Link from "next/link";
import Logo from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Directory | SwiftSpaces",
  description: "Find and connect with top verified real estate agents in your area.",
};

export default async function AgentsDirectoryPage() {
  const agents = await prisma.user.findMany({
    where: { role: "AGENT", agentStatus: "ACTIVE" },
    include: {
      _count: {
        select: { properties: true }
      }
    },
    orderBy: { properties: { _count: 'desc' } } // "Ranked" by number of properties for now
  });

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-outfit)', backgroundColor: 'var(--color-surface-secondary)', position: 'relative', paddingBottom: '4rem', paddingTop: '80px' }}>

      {/* Navbar */}
      <nav className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container nav-container">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo width={36} height={36} />
          </Link>
          <div className="nav-links">
            <Link href="/properties" className="nav-link" style={{ color: 'var(--color-text-main)' }}>Properties</Link>
            <Link href="/agents" className="nav-link" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Agents</Link>
            <Link href="/saved" className="nav-link" style={{ color: 'var(--color-text-main)' }}>❤️ Saved</Link>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Dark Hero Banner */}
      <div style={{ background: '#0F172A', padding: '6rem 0 4rem 0', position: 'relative', zIndex: 1, marginTop: '-2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>
              The Elite Network
            </div>
            <h1 className="display-1" style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Verified Agent <span style={{ color: 'var(--color-primary)' }}>Directory</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Browse our network of top-tier verified real estate professionals. Find the perfect agent to help you buy, sell, or rent your next home.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {agents.map((agent: any) => (
            <Link href={`/agents/${agent.id}`} key={agent.id} className="animate-fade-in card" style={{ 
              textDecoration: 'none', color: 'inherit', padding: '2.5rem 2rem', textAlign: 'center', 
              transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: '16px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--color-surface-secondary)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.25rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                {agent.agencyName ? agent.agencyName.charAt(0) : "A"}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>{agent.agencyName || "Independent Agent"}</h2>
              <p style={{ color: 'var(--color-teal)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Premium Partner</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{agent._count.properties}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginTop: '0.25rem' }}>Listings</div>
                </div>
                <div style={{ width: '1px', background: 'var(--color-border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    4.9
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginTop: '0.25rem' }}>Rating</div>
                </div>
              </div>
            </Link>
          ))}
          
          {agents.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1.5rem auto', opacity: 0.8 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>No Agents Found</h3>
              <p>There are no active verified agents on the platform right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
