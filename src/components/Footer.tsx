import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#020617', // Very deep slate/navy (darker than the trust section)
      color: '#94a3b8', 
      padding: '4rem 0 2rem 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-between', marginBottom: '3rem' }}>
          
          {/* Column 1: Brand */}
          <div style={{ flex: '1 1 300px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
              <Logo width={32} height={32} invertText={true} />
            </Link>
            <p style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>
              The premium destination to find, buy, and rent luxury properties, homes, and vacant land worldwide.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Social Placeholders */}
              <a href="#" aria-label="Twitter" className="footer-social-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" aria-label="Instagram" className="footer-social-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="footer-social-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Properties</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link href="/properties?type=house" className="footer-link">Houses for Sale</Link></li>
              <li><Link href="/properties?type=rent" className="footer-link">Apartments for Rent</Link></li>
              <li><Link href="/properties?type=land" className="footer-link">Vacant Land & Plots</Link></li>
              <li><Link href="/properties?type=airbnb" className="footer-link">Vacation Rentals</Link></li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Navigation</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link href="/" className="footer-link">Home</Link></li>
              <li><Link href="/properties" className="footer-link">Browse Properties</Link></li>
              <li><Link href="/agents" className="footer-link">Our Agents</Link></li>
              <li><Link href="/manager" className="footer-link">Manager Portal</Link></li>
              <li><Link href="/admin" className="footer-link">Admin Portal</Link></li>
              <li><Link href="/register" className="footer-link">List a Property</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div style={{ flex: '1 1 250px' }}>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Subscribe</h4>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Get the latest premium listings delivered directly to your inbox.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder="Email address" style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} />
              <button className="footer-btn">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', fontSize: '0.875rem' }}>
          <p>&copy; {new Date().getFullYear()} SwiftSpaces Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/privacy" className="footer-legal-link">Privacy Policy</Link>
            <Link href="/terms" className="footer-legal-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
