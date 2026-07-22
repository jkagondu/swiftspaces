import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SwiftSpaces | Premium Real Estate & Homes",
    template: "%s | SwiftSpaces"
  },
  description: "Discover exclusive homes, high-end apartments, and commercial spaces tailored to your luxury lifestyle. Connect directly with verified agents.",
  keywords: ["Real Estate", "Luxury Homes", "Apartments", "Property Investment", "SwiftSpaces"],
  authors: [{ name: "SwiftSpaces Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://swiftspaces.com",
    title: "SwiftSpaces | Premium Real Estate",
    description: "Discover exclusive homes and apartments tailored to your luxury lifestyle.",
    siteName: "SwiftSpaces",
    images: [{
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
      width: 1200,
      height: 630,
      alt: "SwiftSpaces Premium Real Estate",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftSpaces | Premium Real Estate",
    description: "Discover exclusive homes and apartments tailored to your luxury lifestyle.",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200"],
  },
  verification: {
    google: "KjHKO7e73ZUPTM-QXfTBWqTh4qnjAI0T549GxeW9PaA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
