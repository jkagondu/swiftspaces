import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids: string }>;
}) {
  const { ids } = await searchParams;

  if (!ids) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <h1 className="heading-2">No Properties Selected</h1>
        <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>Please go back and select some properties to compare.</p>
        <Link href="/" className="btn btn-primary">Browse Properties</Link>
      </div>
    );
  }

  const propertyIds = ids.split(",").slice(0, 3); // Max 3 to compare

  const properties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    include: { agent: true }
  });

  if (properties.length === 0) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="heading-2" style={{ margin: 0 }}>Compare Properties</h1>
        <Link href="/" className="btn btn-outline">Back to Search</Link>
      </div>

      <div className="card table-container" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
              <th style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', width: '20%' }}>Features</th>
              {properties.map((p) => (
                <th key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', width: `${80 / properties.length}%` }}>
                  <div style={{ position: 'relative', height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                    <Image 
                      src={p.images && p.images.length > 0 ? p.images[0] : "/prop-modern.png"} 
                      alt={p.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>{p.title}</h3>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.25rem' }}>{p.price}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Location</td>
              {properties.map(p => (
                <td key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>{p.location}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Property Type</td>
              {properties.map(p => (
                <td key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: 'var(--color-surface-secondary)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {p.type.replace('_', ' ')}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Status</td>
              {properties.map(p => (
                <td key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: p.status.includes('FOR_') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: p.status.includes('FOR_') ? '#10b981' : '#f59e0b', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {p.status.replace('_', ' ')}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Bedrooms</td>
              {properties.map(p => (
                <td key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>{p.beds}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Bathrooms</td>
              {properties.map(p => (
                <td key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>{p.baths}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Amenities</td>
              {properties.map(p => (
                <td key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', verticalAlign: 'top' }}>
                  {p.amenities && p.amenities.length > 0 ? (
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {p.amenities.map((amenity, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">No specific amenities listed</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '1.5rem', fontWeight: 600 }}>Action</td>
              {properties.map(p => (
                <td key={p.id} style={{ padding: '1.5rem' }}>
                  <Link href={`/properties/${p.id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                    View Property
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
