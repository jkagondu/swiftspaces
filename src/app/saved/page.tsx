"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import { useSavedProperties } from "@/components/SavePropertyButton";

export default function SavedPropertiesPage() {
  const { saved, clearAll, toggleSave } = useSavedProperties();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-surface-secondary)", paddingBottom: "4rem" }}>
      {/* Navbar */}
      <nav className="navbar" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="container nav-container">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Logo width={36} height={36} />
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/properties" className="nav-link">Properties</Link>
            <Link href="/agents" className="nav-link">Agents</Link>
            <Link href="/saved" className="nav-link" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Saved</Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div style={{ background: "var(--color-navy)", padding: "4rem 0 3rem 0", marginBottom: "3rem" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                ❤️ Saved Properties
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>
                {mounted && saved.length > 0
                  ? `You have ${saved.length} saved listing${saved.length > 1 ? "s" : ""}.`
                  : "Your shortlisted properties will appear here."}
              </p>
            </div>
            {mounted && saved.length > 0 && (
              <button
                onClick={clearAll}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.1)",
                  color: "#f87171",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.2s",
                }}
              >
                Clear All Saved
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {!mounted ? (
          <div style={{ textAlign: "center", padding: "6rem", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : saved.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", background: "var(--color-surface)", borderRadius: "16px", border: "1px solid var(--color-border)" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" style={{ margin: "0 auto 1.5rem auto", display: "block", opacity: 0.5 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-main)", marginBottom: "0.75rem" }}>No Saved Properties Yet</h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
              Hit the ❤️ button on any property to save it here for easy access.
            </p>
            <Link href="/properties" className="btn btn-primary" style={{ padding: "0.875rem 2.5rem", textDecoration: "none" }}>
              Browse Properties
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {saved.map((property) => (
              <div
                key={property.id}
                className="card property-card animate-fade-in"
                style={{ position: "relative" }}
              >
                {/* Remove button */}
                <button
                  onClick={() => toggleSave(property)}
                  title="Remove from saved"
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    zIndex: 10,
                    padding: "0.5rem",
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(239,68,68,0.15)",
                    color: "#ef4444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                    transition: "all 0.2s",
                  }}
                  aria-label="Remove from saved"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>

                {/* Image */}
                <div style={{ position: "relative", height: "200px" }}>
                  <Image src={property.image} alt={property.title} fill style={{ objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: "1rem", left: "1rem", background: "rgba(15,23,42,0.7)", color: "white", padding: "0.25rem 0.5rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600 }}>
                    Saved {new Date(property.savedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-text-main)" }}>{property.title}</h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {property.location}
                  </p>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "var(--color-text-main)", marginBottom: "1.5rem" }}>
                    {property.beds > 0 && <span>🛏 <strong>{property.beds}</strong> beds</span>}
                    <span>🚿 <strong>{property.baths}</strong> baths</span>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary)" }}>{property.price}</span>
                    <Link
                      href={`/properties/${property.id}`}
                      className="btn btn-primary"
                      style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", textDecoration: "none" }}
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
