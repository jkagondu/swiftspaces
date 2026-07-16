"use client";

import { useState, useEffect } from "react";

interface MortgageCalculatorProps {
  propertyPrice?: string; // e.g. "KES 5,000,000" or "KES 20,000/mo"
}

function parsePrice(raw: string): number {
  // Strip non-numeric chars except dot
  const cleaned = raw.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const rawNum = parsePrice(propertyPrice || "0");
  const isRental = /\/mo|per month|month/i.test(propertyPrice || "");

  // Rental mode state
  const [monthlyRent, setMonthlyRent] = useState(isRental ? rawNum : 0);
  const [depositMonths, setDepositMonths] = useState(2);

  // Mortgage mode state
  const [homePrice, setHomePrice] = useState(!isRental ? rawNum : 0);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTermYears, setLoanTermYears] = useState(20);

  const [mode, setMode] = useState<"mortgage" | "rent">(isRental ? "rent" : "mortgage");

  // --- Mortgage Calculation ---
  const downPaymentAmt = (homePrice * downPaymentPct) / 100;
  const principal = homePrice - downPaymentAmt;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : principal / numPayments;
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - principal;

  // --- Rental Calculation ---
  const depositAmt = monthlyRent * depositMonths;
  const moveInTotal = monthlyRent + depositAmt;

  const fmt = (n: number) =>
    "KES " +
    Math.round(n)
      .toLocaleString("en-KE");

  return (
    <div
      className="card"
      style={{ padding: "2rem", border: "1px solid var(--color-border)" }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        {mode === "mortgage" ? "Mortgage Calculator" : "Rental Cost Estimator"}
      </h2>

      {/* Mode Toggle */}
      <div style={{ display: "flex", background: "var(--color-surface-secondary)", borderRadius: "10px", padding: "4px", marginBottom: "1.75rem", border: "1px solid var(--color-border)" }}>
        {(["mortgage", "rent"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "0.875rem", transition: "all 0.2s",
              background: mode === m ? "white" : "transparent",
              color: mode === m ? "var(--color-primary)" : "var(--color-text-muted)",
              boxShadow: mode === m ? "var(--shadow-sm)" : "none",
            }}
          >
            {m === "mortgage" ? "🏠 Buy" : "🔑 Rent"}
          </button>
        ))}
      </div>

      {mode === "mortgage" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Home Price */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-main)" }}>
              <span>Home Price</span>
              <span style={{ color: "var(--color-primary)" }}>{fmt(homePrice)}</span>
            </label>
            <input type="range" min={500000} max={50000000} step={100000}
              value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-primary)" }} />
          </div>

          {/* Down Payment */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-main)" }}>
              <span>Down Payment ({downPaymentPct}%)</span>
              <span style={{ color: "var(--color-primary)" }}>{fmt(downPaymentAmt)}</span>
            </label>
            <input type="range" min={5} max={50} step={1}
              value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-primary)" }} />
          </div>

          {/* Interest Rate */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-main)" }}>
              <span>Interest Rate</span>
              <span style={{ color: "var(--color-primary)" }}>{interestRate}% p.a.</span>
            </label>
            <input type="range" min={5} max={25} step={0.5}
              value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-primary)" }} />
          </div>

          {/* Loan Term */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-main)" }}>
              <span>Loan Term</span>
              <span style={{ color: "var(--color-primary)" }}>{loanTermYears} years</span>
            </label>
            <input type="range" min={5} max={30} step={5}
              value={loanTermYears} onChange={(e) => setLoanTermYears(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-primary)" }} />
          </div>

          {/* Results */}
          <div style={{ borderRadius: "12px", background: "linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%)", color: "white", padding: "1.5rem", marginTop: "0.5rem" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: "0.5rem" }}>
              Estimated Monthly Payment
            </div>
            <div style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-primary)" }}>
              {fmt(monthlyPayment)}
            </div>
            <div style={{ marginTop: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.25rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Total Cost</div>
                <div style={{ fontWeight: 700 }}>{fmt(totalPaid)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Total Interest</div>
                <div style={{ fontWeight: 700, color: "#f87171" }}>{fmt(totalInterest)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Loan Amount</div>
                <div style={{ fontWeight: 700 }}>{fmt(principal)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Down Payment</div>
                <div style={{ fontWeight: 700 }}>{fmt(downPaymentAmt)}</div>
              </div>
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "center" }}>
            * Estimates only. Consult a financial advisor for exact figures.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Monthly Rent */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-main)" }}>
              <span>Monthly Rent</span>
              <span style={{ color: "var(--color-primary)" }}>{fmt(monthlyRent)}</span>
            </label>
            <input type="range" min={5000} max={500000} step={1000}
              value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-primary)" }} />
          </div>

          {/* Deposit Months */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-main)" }}>
              <span>Security Deposit</span>
              <span style={{ color: "var(--color-primary)" }}>{depositMonths} month(s)</span>
            </label>
            <input type="range" min={1} max={6} step={1}
              value={depositMonths} onChange={(e) => setDepositMonths(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-primary)" }} />
          </div>

          {/* Results */}
          <div style={{ borderRadius: "12px", background: "linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%)", color: "white", padding: "1.5rem", marginTop: "0.5rem" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: "0.5rem" }}>
              Move-In Total Required
            </div>
            <div style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-primary)" }}>
              {fmt(moveInTotal)}
            </div>
            <div style={{ marginTop: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.25rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>First Month Rent</div>
                <div style={{ fontWeight: 700 }}>{fmt(monthlyRent)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Security Deposit</div>
                <div style={{ fontWeight: 700 }}>{fmt(depositAmt)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Annual Cost</div>
                <div style={{ fontWeight: 700 }}>{fmt(monthlyRent * 12)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>2-Year Cost</div>
                <div style={{ fontWeight: 700 }}>{fmt(monthlyRent * 24)}</div>
              </div>
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "center" }}>
            * Estimates only. Actual costs may vary per landlord agreement.
          </p>
        </div>
      )}
    </div>
  );
}
