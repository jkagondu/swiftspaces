export default function TermsOfService() {
  return (
    <div style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-outfit), sans-serif', color: '#1e293b' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a' }}>Terms of Service</h1>
      <p style={{ marginBottom: '2rem', fontSize: '1.125rem', color: '#475569' }}>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>1. Acceptance of Terms</h2>
        <p style={{ lineHeight: 1.7 }}>
          By accessing or using the SwiftSpaces platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>2. Description of Service</h2>
        <p style={{ lineHeight: 1.7 }}>
          SwiftSpaces provides an online platform that connects property owners, real estate agents, and individuals seeking to buy, rent, or lease properties. We are not a real estate broker or lender, and we do not act as an agent for any user unless explicitly stated otherwise.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>3. User Conduct and Listings</h2>
        <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
          You agree to use the platform only for lawful purposes. If you post a property listing, you represent and warrant that you have the right to list the property and that all information provided is accurate and not misleading.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          We reserve the right to remove any listing or suspend any account that violates these terms, including listings that are fraudulent, discriminatory, or offensive.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>4. Limitation of Liability</h2>
        <p style={{ lineHeight: 1.7 }}>
          SwiftSpaces is not responsible for the accuracy of property listings or the actions of any users on the platform. In no event shall SwiftSpaces be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of our services.
        </p>
      </section>

      <p style={{ marginTop: '4rem', fontSize: '0.875rem', color: '#64748b' }}>
        For legal inquiries regarding these Terms of Service, please contact legal@swiftspace.africa.
      </p>
    </div>
  );
}
