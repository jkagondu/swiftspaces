"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "swiftspaces_saved_properties";

interface SavedProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  beds: number;
  baths: number;
  savedAt: string;
}

// Hook to use anywhere
export function useSavedProperties() {
  const [saved, setSaved] = useState<SavedProperty[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  const isPropertySaved = useCallback(
    (id: string) => saved.some((p) => p.id === id),
    [saved]
  );

  const toggleSave = useCallback((property: SavedProperty) => {
    setSaved((prev) => {
      let next: SavedProperty[];
      if (prev.some((p) => p.id === property.id)) {
        next = prev.filter((p) => p.id !== property.id);
      } else {
        next = [...prev, { ...property, savedAt: new Date().toISOString() }];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSaved([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { saved, isPropertySaved, toggleSave, clearAll };
}

// Standalone bookmark button component
interface SaveButtonProps {
  property: {
    id: string;
    title: string;
    price: string;
    location: string;
    images?: string[];
    beds: number;
    baths: number;
  };
  size?: "sm" | "md";
  showLabel?: boolean;
}

export default function SavePropertyButton({
  property,
  size = "md",
  showLabel = false,
}: SaveButtonProps) {
  const { isPropertySaved, toggleSave } = useSavedProperties();
  const [isSaved, setIsSaved] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Must read localStorage only client-side
  useEffect(() => {
    setIsSaved(isPropertySaved(property.id));
  }, [property.id, isPropertySaved]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const savedProperty: SavedProperty = {
      id: property.id,
      title: property.title,
      price: property.price,
      location: property.location,
      image: property.images?.[0] || "/prop-modern.png",
      beds: property.beds,
      baths: property.baths,
      savedAt: "",
    };
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    toggleSave(savedProperty);
    setIsSaved((prev) => !prev);
  };

  const iconSize = size === "sm" ? 16 : 20;
  const btnSize = size === "sm" ? "0.5rem 0.75rem" : "0.6rem 1rem";

  return (
    <button
      onClick={handleClick}
      title={isSaved ? "Remove from saved" : "Save property"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: btnSize,
        borderRadius: "8px",
        border: isSaved
          ? "1px solid rgba(239,68,68,0.3)"
          : "1px solid var(--color-border)",
        background: isSaved ? "rgba(239,68,68,0.08)" : "white",
        color: isSaved ? "#ef4444" : "var(--color-text-muted)",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.8rem",
        transition: "all 0.25s ease",
        transform: animating ? "scale(1.25)" : "scale(1)",
        boxShadow: isSaved ? "0 0 0 2px rgba(239,68,68,0.15)" : "none",
      }}
      aria-label={isSaved ? "Unsave property" : "Save property"}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      {showLabel && (isSaved ? "Saved" : "Save")}
    </button>
  );
}
