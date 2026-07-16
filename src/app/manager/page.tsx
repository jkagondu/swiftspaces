"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    type: "two-bedroom",
    status: "FOR_RENT",
    description: "",
    beds: "",
    baths: "",
  });
  
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [contactedInquiries, setContactedInquiries] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchInquiries();
      fetchMyListings();
    }
  }, [status, router]);

  const fetchInquiries = async () => {
    setIsLoadingInquiries(true);
    try {
      const res = await fetch("/api/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (error) {
      console.error("Failed to fetch inquiries", error);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const fetchMyListings = async () => {
    setIsLoadingListings(true);
    try {
      const res = await fetch("/api/agent/properties");
      if (res.ok) {
        const data = await res.json();
        setMyListings(data);
      }
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const handleMarkAsTaken = async (propertyId: string, currentType: string) => {
    const newStatus = currentType === "FOR_SALE" ? "SOLD" : "RENTED";
    try {
      const res = await fetch("/api/properties/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, status: newStatus }),
      });
      if (res.ok) {
        setMyListings(prev => prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  // Prevent posting if not approved
  const isApproved = (session?.user as any)?.agentStatus === "ACTIVE";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage("");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "swiftspaces_preset";

    if (!cloudName) {
      setErrorMessage("Cloudinary Cloud Name is missing in .env");
      setIsUploading(false);
      return;
    }

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
          return data.secure_url;
        } else {
          throw new Error(data.error?.message || "Failed to upload an image");
        }
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImageUrls((prev) => [...prev, ...urls]);
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Error uploading images.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // We hardcode agentId and an image for now until Auth & AWS S3 are set up
      const payload = {
        ...formData,
        type: formData.type.toUpperCase().replace("-", "_"),
        agentId: (session?.user as any)?.id || "mock-agent-id-12345", 
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/prop-2bed.png"]
      };

      const res = await fetch(editingPropertyId ? `/api/properties/${editingPropertyId}` : "/api/properties", {
        method: editingPropertyId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save property");
      }

      setSuccessMessage(editingPropertyId ? "Property updated successfully!" : "Property published successfully to the live site!");
      setFormData({
        title: "", location: "", price: "", type: "two-bedroom", status: "FOR_RENT", description: "", beds: "", baths: ""
      });
      setUploadedImageUrls([]);
      setEditingPropertyId(null);
      if (editingPropertyId) {
        fetchMyListings();
      }
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      setErrorMessage("Error publishing property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-surface-secondary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/" className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            SwiftSpaces
          </Link>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Manager Portal</div>
        </div>
        
        <nav style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => setActiveTab("overview")}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "overview" ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === "overview" ? 'var(--color-primary)' : 'var(--color-text-main)',
              fontWeight: activeTab === "overview" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            Dashboard Overview
          </button>
          <button 
            onClick={() => {
              setActiveTab("add_property");
              setEditingPropertyId(null);
              setFormData({ title: "", location: "", price: "", type: "two-bedroom", status: "FOR_RENT", description: "", beds: "", baths: "" });
              setUploadedImageUrls([]);
            }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "add_property" ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === "add_property" ? 'var(--color-primary)' : 'var(--color-text-main)',
              fontWeight: activeTab === "add_property" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            {editingPropertyId ? "Edit Property" : "+ Add New Property"}
          </button>
          <button 
            onClick={() => setActiveTab("my_listings")}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "my_listings" ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === "my_listings" ? 'var(--color-primary)' : 'var(--color-text-main)',
              fontWeight: activeTab === "my_listings" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            My Listings
          </button>
          <button 
            onClick={() => setActiveTab("inquiries")}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "inquiries" ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === "inquiries" ? 'var(--color-primary)' : 'var(--color-text-main)',
              fontWeight: activeTab === "inquiries" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            Client Inquiries
          </button>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {(session?.user as any)?.agencyName?.charAt(0) || "A"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{(session?.user as any)?.agencyName || "Agent"}</div>
              <div style={{ fontSize: '0.75rem', color: (session?.user as any)?.agentStatus === "ACTIVE" ? '#10b981' : '#f59e0b' }}>
                Status: {(session?.user as any)?.agentStatus}
              </div>
            </div>
          </div>
          <button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        
        {activeTab === "overview" && (
          <div className="animate-fade-in">
            <h1 className="heading-2" style={{ marginBottom: '2rem' }}>Welcome back, {(session?.user as any)?.agencyName || "Agent"}</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Active Listings</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{myListings.filter(p => p.status.includes('FOR_') || p.status === 'SHORT_TERM').length}</div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Properties Sold/Rented</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{myListings.filter(p => p.status === 'SOLD' || p.status === 'RENTED').length}</div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Inquiries</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b' }}>{inquiries.length}</div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Inquiries</h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Customer Name</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Property Interested In</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Date</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.slice(0, 5).map((inquiry: any) => (
                    <tr key={inquiry.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{inquiry.customerName}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{inquiry.property?.title || "Unknown Property"}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}><button onClick={() => setActiveTab('inquiries')} className="btn btn-primary" style={{ padding: '0.25rem 1rem', fontSize: '0.75rem' }}>View</button></td>
                    </tr>
                  ))}
                  {inquiries.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No recent inquiries.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "add_property" && (
          <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <h1 className="heading-2" style={{ marginBottom: '2rem' }}>{editingPropertyId ? "Edit Property" : "Add New Property"}</h1>
            
            <div className="card" style={{ padding: '2rem' }}>
              
              {successMessage && (
                <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#047857', borderRadius: 'var(--radius-md)' }}>
                  ✅ {successMessage}
                </div>
              )}
              {errorMessage && (
                <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#b91c1c', borderRadius: 'var(--radius-md)' }}>
              ❌ {errorMessage}
                </div>
              )}

              {!isApproved ? (
                <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#b45309', borderRadius: 'var(--radius-md)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Account Pending Approval</h3>
                  <p>You cannot post properties until the Super Admin approves your account. Please check back later.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Image Upload Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Property Images</label>
                  
                  {uploadedImageUrls.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      {uploadedImageUrls.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => setUploadedImageUrls(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label style={{ 
                    border: '2px dashed var(--color-border)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '2rem', 
                    textAlign: 'center',
                    backgroundColor: 'var(--color-surface-secondary)',
                    cursor: isUploading ? 'wait' : 'pointer',
                    display: 'block',
                    opacity: isUploading ? 0.6 : 1
                  }}>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp" 
                      multiple
                      style={{ display: 'none' }} 
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem auto' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>
                      {isUploading ? "Uploading to Cloudinary..." : "Click to upload multiple images"}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Select multiple PNG, JPG, WEBP up to 10MB</div>
                  </label>
                </div>

                {/* Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Property Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} required type="text" placeholder="e.g. Modern 3-Bedroom Apartment" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                </div>

                {/* Grid for Price & Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Location / Address</label>
                    <input name="location" value={formData.location} onChange={handleInputChange} required type="text" placeholder="e.g. Kileleshwa, Nairobi" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Price</label>
                    <input name="price" value={formData.price} onChange={handleInputChange} required type="text" placeholder="e.g. Ksh 40,000 / month" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                </div>

                {/* Grid for Beds & Baths */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Bedrooms</label>
                    <input name="beds" value={formData.beds} onChange={handleInputChange} type="number" placeholder="e.g. 2" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Bathrooms</label>
                    <input name="baths" value={formData.baths} onChange={handleInputChange} type="number" placeholder="e.g. 1" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                </div>

                {/* Grid for Type & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Property Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'white' }}>
                      <option value="single-room">Single Room</option>
                      <option value="bedsitter">Bedsitter</option>
                      <option value="one-bedroom">1 Bedroom</option>
                      <option value="two-bedroom">2 Bedroom</option>
                      <option value="airbnb">Airbnb / Short Stay</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'white' }}>
                      <option value="FOR_RENT">For Rent</option>
                      <option value="FOR_SALE">For Sale</option>
                      <option value="SHORT_TERM">Short Term (Airbnb)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Describe the property..." style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.75rem 2rem', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? (editingPropertyId ? "Updating..." : "Publishing...") : (editingPropertyId ? "Update Property" : "Publish Listing")}
                  </button>
                  {editingPropertyId && (
                    <button type="button" onClick={() => {
                      setEditingPropertyId(null);
                      setFormData({ title: "", location: "", price: "", type: "two-bedroom", status: "FOR_RENT", description: "", beds: "", baths: "" });
                      setUploadedImageUrls([]);
                      setActiveTab("my_listings");
                    }} className="btn btn-outline" style={{ padding: '0.75rem 2rem', marginLeft: '1rem' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              )}
            </div>
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === "inquiries" && (
          <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
            <h1 className="heading-2" style={{ marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Client Inquiries</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Manage and respond to property leads.</p>
            
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {isLoadingInquiries ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading inquiries...</div>
              ) : inquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <p style={{ fontSize: '1.125rem' }}>Your inbox is empty.</p>
                  <p style={{ fontSize: '0.875rem' }}>When clients request a viewing, they will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {inquiries.map((inquiry: any) => {
                    const isContacted = contactedInquiries.has(inquiry.id);
                    return (
                      <div key={inquiry.id} style={{ 
                        padding: '1.5rem 2rem', 
                        borderBottom: '1px solid var(--color-border)', 
                        backgroundColor: isContacted ? 'var(--color-surface)' : 'white',
                        transition: 'all 0.2s',
                        opacity: isContacted ? 0.7 : 1
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                              {inquiry.customerName.charAt(0)}
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {inquiry.customerName}
                                {isContacted && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>Replied</span>}
                                {!isContacted && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></span>}
                              </h3>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{inquiry.customerEmail} {inquiry.customerPhone ? ` • ${inquiry.customerPhone}` : ''}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div style={{ marginLeft: '3.5rem' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Property: {inquiry.property?.title || 'Unknown Property'}
                          </div>
                          <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1rem', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text-main)' }}>
                            "{inquiry.message}"
                          </div>
                          
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <a 
                              href={`mailto:${inquiry.customerEmail}`} 
                              onClick={() => setContactedInquiries(prev => new Set(prev).add(inquiry.id))}
                              className="btn btn-primary" 
                              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                              Email Client
                            </a>
                            {inquiry.customerPhone && (
                              <a 
                                href={`tel:${inquiry.customerPhone}`} 
                                onClick={() => setContactedInquiries(prev => new Set(prev).add(inquiry.id))}
                                className="btn btn-outline" 
                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                Call Client
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MY LISTINGS TAB */}
        {activeTab === "my_listings" && (
          <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
            <h1 className="heading-2" style={{ marginBottom: '2rem', letterSpacing: '-0.02em' }}>My Listings</h1>
            
            <div className="card" style={{ padding: '2rem' }}>
              {isLoadingListings ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading properties...</div>
              ) : myListings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <p>You haven't uploaded any properties yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {myListings.map((property: any) => (
                    <div key={property.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'white' }}>
                      <div style={{ width: '150px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={property.images && property.images.length > 0 ? property.images[0] : "/prop-modern.png"} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 5, left: 5, padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '4px' }}>
                          {property.status.replace('_', ' ')}
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{property.title}</h3>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{property.location}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>{property.price}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button onClick={() => {
                            setEditingPropertyId(property.id);
                            setFormData({
                              title: property.title || "",
                              location: property.location || "",
                              price: property.price || "",
                              type: property.type?.toLowerCase().replace('_', '-') || "two-bedroom",
                              status: property.status || "FOR_RENT",
                              description: property.description || "",
                              beds: property.beds?.toString() || "",
                              baths: property.baths?.toString() || "",
                            });
                            setUploadedImageUrls(property.images || []);
                            setActiveTab("add_property");
                          }} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                            Edit
                          </button>
                          <Link href={`/properties/${property.id}`} target="_blank" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>View Live</Link>
                          {(property.status === "FOR_RENT" || property.status === "FOR_SALE" || property.status === "SHORT_TERM") && (
                            <button onClick={() => handleMarkAsTaken(property.id, property.status)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', backgroundColor: '#f59e0b', color: 'white', border: 'none' }}>
                              Mark as Taken
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
