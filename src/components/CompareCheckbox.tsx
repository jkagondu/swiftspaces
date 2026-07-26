"use client";

import { useCompare } from "./CompareContext";

export default function CompareCheckbox({ propertyId }: { propertyId: string }) {
  const { compareList, toggleCompare } = useCompare();
  
  const isSelected = compareList.includes(propertyId);

  return (
    <label 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
        backgroundColor: 'var(--color-surface-secondary)',
        padding: '0.25rem 0.5rem',
        borderRadius: '8px',
        border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        transition: 'all 0.2s'
      }}
      onClick={(e) => e.stopPropagation()} // Prevent card click
    >
      <input 
        type="checkbox" 
        checked={isSelected}
        onChange={() => toggleCompare(propertyId)}
        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
      />
      Compare
    </label>
  );
}
