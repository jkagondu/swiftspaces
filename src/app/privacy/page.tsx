export default function PrivacyPolicy() {
  return (
    <div style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-outfit), sans-serif', color: '#1e293b' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a' }}>Privacy Policy</h1>
      <p style={{ marginBottom: '2rem', fontSize: '1.125rem', color: '#475569' }}>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>1. Information We Collect</h2>
        <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
          At SwiftSpaces, we collect information you provide directly to us, such as when you create an account, list a property, update your profile, or communicate with us. This may include your name, email address, phone number, and any other information you choose to provide.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          We also automatically collect certain information about your device and how you interact with our platform, including your IP address, browser type, location data (if permitted), and browsing activity.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>2. How We Use Your Information</h2>
        <ul style={{ lineHeight: 1.7, paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>To provide, maintain, and improve our real estate platform.</li>
          <li style={{ marginBottom: '0.5rem' }}>To process your transactions and send related information.</li>
          <li style={{ marginBottom: '0.5rem' }}>To send you technical notices, updates, security alerts, and support messages.</li>
          <li style={{ marginBottom: '0.5rem' }}>To respond to your comments, questions, and customer service requests.</li>
          <li style={{ marginBottom: '0.5rem' }}>To connect property seekers with relevant real estate agents.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>3. Data Sharing and Security</h2>
        <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
          We do not sell your personal information. We may share your information with real estate agents or property managers only when you explicitly request to contact them regarding a property.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>4. Your Rights</h2>
        <p style={{ lineHeight: 1.7 }}>
          You have the right to access, update, or delete your personal information at any time through your account settings. You may also contact us to request the removal of your data from our active databases.
        </p>
      </section>

      <p style={{ marginTop: '4rem', fontSize: '0.875rem', color: '#64748b' }}>
        If you have any questions about this Privacy Policy, please contact us at support@swiftspace.africa.
      </p>
    </div>
  );
}
