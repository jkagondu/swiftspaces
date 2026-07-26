"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Link from "next/link";

interface CompareContextType {
  compareList: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType>({
  compareList: [],
  toggleCompare: () => {},
  clearCompare: () => {},
});

export const useCompare = () => useContext(CompareContext);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("swiftspaces_compare");
      if (stored) {
        setCompareList(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter((p) => p !== id);
      } else {
        if (prev.length >= 3) {
          alert("You can only compare up to 3 properties at a time.");
          return prev;
        }
        next = [...prev, id];
      }
      localStorage.setItem("swiftspaces_compare", JSON.stringify(next));
      return next;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem("swiftspaces_compare");
  };

  return (
    <CompareContext.Provider value={{ compareList, toggleCompare, clearCompare }}>
      {children}
      {compareList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-navy)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '30px',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          zIndex: 1000,
        }}>
          <div style={{ fontWeight: 600 }}>
            {compareList.length} {compareList.length === 1 ? "Property" : "Properties"} Selected
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link 
              href={`/compare?ids=${compareList.join(",")}`} 
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Compare Now
            </Link>
            <button 
              onClick={clearCompare}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </CompareContext.Provider>
  );
}
