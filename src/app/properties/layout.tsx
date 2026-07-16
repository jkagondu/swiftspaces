import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Properties",
  description: "Browse our exclusive collection of premium real estate properties. Filter by location, price, and amenities on our interactive map.",
  openGraph: {
    title: "Search Premium Properties | SwiftSpaces",
    description: "Explore available houses, apartments, and land on our interactive real estate map.",
    images: [{
      url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200",
      width: 1200,
      height: 630,
      alt: "SwiftSpaces Interactive Property Map",
    }],
  }
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
