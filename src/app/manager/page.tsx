"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    type: "apartment",
    status: "FOR_RENT",
    description: "",
    beds: "",
    baths: "",
    latitude: "",
    longitude: "",
    videoUrl: "",
    virtualTourUrl: "",
    tiktokUrl: "",
    transitScore: "",
    walkability: "",
    nearbyPlaces: "",
    nearbySchools: "",
    nearbyHospitals: "",
    deposit: "",
    waterBill: "",
    electricity: "",
    parking: "",
    petFriendly: false,
  });
  
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  // Profile State
  const [profileData, setProfileData] = useState({
    facebookUrl: (session?.user as any)?.facebookUrl || "",
    twitterUrl: (session?.user as any)?.twitterUrl || "",
    instagramUrl: (session?.user as any)?.instagramUrl || "",
    linkedinUrl: (session?.user as any)?.linkedinUrl || "",
    logoUrl: (session?.user as any)?.logoUrl || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMessage("");
    setProfileErrorMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        await update(profileData);
        setProfileSuccessMessage("Profile updated successfully!");
      } else {
        setProfileErrorMessage("Failed to update profile.");
      }
    } catch (err) {
      setProfileErrorMessage("An error occurred.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [categorizedImageUrls, setCategorizedImageUrls] = useState<{ [category: string]: string[] }>({});
  const [uploadCategory, setUploadCategory] = useState("All");
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

      // Check for payment callback
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');
      const paymentStatus = urlParams.get('payment');
      
      if (paymentStatus === 'success' && reference) {
        verifyPayment(reference);
      }
    }
  }, [status, router]);

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch("/api/payments/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Payment successful! Your agency has been upgraded to the " + data.plan + " plan.");
        // Clear the URL to avoid re-verifying
        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveTab("overview");
      } else {
        alert("Payment verification failed: " + data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInquiries = async () => {
    setIsLoadingInquiries(true);
    try {
      const res = await fetch(`/api/inquiries?t=${Date.now()}`, { cache: 'no-store' });
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
      const res = await fetch(`/api/agent/properties?t=${Date.now()}`, { cache: 'no-store' });
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

  const handleToggleStatus = async (propertyId: string, currentStatus: string) => {
    let newStatus = "";
    if (currentStatus === "FOR_SALE") newStatus = "SOLD";
    else if (currentStatus === "SOLD") newStatus = "FOR_SALE";
    else if (currentStatus === "FOR_RENT" || currentStatus === "SHORT_TERM") newStatus = "RENTED";
    else if (currentStatus === "RENTED") newStatus = "FOR_RENT";
    
    try {
      const res = await fetch("/api/properties/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, status: newStatus }),
      });
      if (res.ok) {
        setMyListings(prev => prev.map((p: any) => p.id === propertyId ? { ...p, status: newStatus } : p));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMyListings(prev => prev.filter((p: any) => p.id !== propertyId));
      } else {
        alert("Failed to delete property");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting property");
    }
  };

  const handleSubscribe = async (plan: string, amount: number) => {
    try {
      const res = await fetch("/api/payments/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, amount }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url; // Redirect to Paystack checkout
      } else {
        alert(data.error || "Payment initialization failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while initializing payment.");
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  // Prevent posting if not approved (Admins are always approved)
  const isApproved = (session?.user as any)?.agentStatus === "ACTIVE" || (session?.user as any)?.role === "ADMIN";

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
      const uploadPromises = Array.from(files).map(async (file: any) => {
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
      if (uploadCategory !== "All") {
        setCategorizedImageUrls(prev => {
          const currentCat = prev[uploadCategory] || [];
          return { ...prev, [uploadCategory]: [...currentCat, ...urls] };
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Error uploading images.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "yeuu8aup";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "swiftspaces_preset";
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to upload logo");
      
      setProfileData(prev => ({ ...prev, logoUrl: data.secure_url }));
    } catch (error: any) {
      console.error("Logo upload error:", error);
      setProfileErrorMessage(error.message || "Error uploading logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
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
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/prop-2bed.png"],
        categorizedImages: Object.keys(categorizedImageUrls).length > 0 ? categorizedImageUrls : undefined
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
        title: "", location: "", price: "", type: "apartment", status: "FOR_RENT", description: "", beds: "", baths: "", latitude: "", longitude: "", videoUrl: "", virtualTourUrl: "", tiktokUrl: "", transitScore: "", walkability: "", nearbyPlaces: "", nearbySchools: "", nearbyHospitals: "", deposit: "", waterBill: "", electricity: "", parking: "", petFriendly: false 
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
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`} style={{ width: '280px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
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
            onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }}
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
              setFormData({ title: "", location: "", price: "", type: "apartment", status: "FOR_RENT", description: "", beds: "", baths: "", latitude: "", longitude: "", videoUrl: "", virtualTourUrl: "", tiktokUrl: "", transitScore: "", walkability: "", nearbyPlaces: "", nearbySchools: "", nearbyHospitals: "", deposit: "", waterBill: "", electricity: "", parking: "", petFriendly: false });
              setUploadedImageUrls([]);
              setIsSidebarOpen(false);
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
            onClick={() => { setActiveTab("my_listings"); setIsSidebarOpen(false); }}
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
            onClick={() => { setActiveTab("inquiries"); setIsSidebarOpen(false); }}
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
          <button 
            onClick={() => { setActiveTab("billing"); setIsSidebarOpen(false); }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "billing" ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === "billing" ? 'var(--color-primary)' : 'var(--color-text-main)',
              fontWeight: activeTab === "billing" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            Billing & Subscriptions
          </button>
          <button 
            onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "profile" ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === "profile" ? 'var(--color-primary)' : 'var(--color-text-main)',
              fontWeight: activeTab === "profile" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            Agent Profile
          </button>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {(session?.user as any)?.agencyName?.charAt(0) || "A"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{(session?.user as any)?.agencyName || "Agent"}</div>
              <div style={{ fontSize: '0.75rem', color: ((session?.user as any)?.agentStatus === "ACTIVE" || (session?.user as any)?.role === "ADMIN") ? '#10b981' : '#f59e0b' }}>
                Status: {(session?.user as any)?.role === "ADMIN" ? "ACTIVE (ADMIN)" : (session?.user as any)?.agentStatus}
              </div>
            </div>
          </div>
          <button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main" style={{ flex: 1, overflowY: 'auto' }}>
        
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
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Property Views</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3b82f6' }}>
                  {myListings.reduce((sum, p) => sum + (p.views || 0), 0)}
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Favorites/Saves</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ef4444' }}>
                  {myListings.reduce((sum, p) => sum + (p.saves || 0), 0)}
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Inquiries</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b' }}>{inquiries.length}</div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Inquiries</h2>
            <div className="card table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
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

        {/* --- ADD PROPERTY TAB --- */}
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
                      {uploadedImageUrls.map((url, idx) => {
                        let currentCat = "Uncategorized";
                        for (const [cat, urls] of Object.entries(categorizedImageUrls)) {
                          if (urls.includes(url)) {
                            currentCat = cat;
                            break;
                          }
                        }
                        
                        return (
                          <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {currentCat !== "Uncategorized" && (
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem', textAlign: 'center', padding: '0.125rem' }}>{currentCat}</div>
                            )}
                            <button 
                              type="button" 
                              onClick={() => {
                                setUploadedImageUrls(prev => prev.filter((_, i) => i !== idx));
                                setCategorizedImageUrls(prev => {
                                  const newObj = { ...prev };
                                  if (currentCat !== "Uncategorized" && newObj[currentCat]) {
                                    newObj[currentCat] = newObj[currentCat].filter(u => u !== url);
                                  }
                                  return newObj;
                                });
                              }}
                              style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Upload Category</label>
                    <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%', outline: 'none', backgroundColor: 'white' }}>
                      <option value="All">Uncategorized (All)</option>
                      <option value="Exterior">Exterior</option>
                      <option value="Rooms">Rooms</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Bathroom">Bathroom</option>
                      <option value="360 View">360 View</option>
                    </select>
                  </div>

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
                      {isUploading ? "Uploading to Cloudinary..." : `Click to upload ${uploadCategory === "All" ? "multiple" : uploadCategory} images`}
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

                {/* Grid for Coordinates (Optional) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Exact Coordinates (Optional)</label>
                    <button type="button" onClick={handleGetLocation} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                      Get My Location
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <input name="latitude" value={formData.latitude} onChange={handleInputChange} type="text" placeholder="Latitude (e.g. -1.2921)" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                    <input name="longitude" value={formData.longitude} onChange={handleInputChange} type="text" placeholder="Longitude (e.g. 36.8219)" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>If left blank, coordinates will be automatically guessed based on your Location/Address.</div>
                </div>


                {/* Neighborhood Insights */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'var(--color-surface-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Transit Score (Optional)</label>
                    <input name="transitScore" value={formData.transitScore} onChange={handleInputChange} type="text" placeholder="e.g. 85/100 (Excellent Transit)" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Walkability (Optional)</label>
                    <input name="walkability" value={formData.walkability} onChange={handleInputChange} type="text" placeholder="e.g. Very Walkable Neighborhood" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                </div>
                  
                  {/* Financial & Utilities */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Deposit Required (Optional)</label>
                      <input name="deposit" value={formData.deposit} onChange={handleInputChange} type="text" placeholder="e.g. 1 Month Rent, or None" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Water Bill (Optional)</label>
                      <input name="waterBill" value={formData.waterBill} onChange={handleInputChange} type="text" placeholder="e.g. Included, Separate Meter" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Electricity Bill (Optional)</label>
                      <input name="electricity" value={formData.electricity} onChange={handleInputChange} type="text" placeholder="e.g. Prepaid Tokens, Included" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Parking (Optional)</label>
                      <input name="parking" value={formData.parking} onChange={handleInputChange} type="text" placeholder="e.g. 1 slot, 2 car garage" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                    </div>
                  </div>

                  {/* Neighborhood Insights */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Nearby Places</label>
                      <input name="nearbyPlaces" value={formData.nearbyPlaces} onChange={handleInputChange} type="text" placeholder="e.g. Supermarkets" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Nearby Schools</label>
                      <input name="nearbySchools" value={formData.nearbySchools} onChange={handleInputChange} type="text" placeholder="e.g. Makini School" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Nearby Hospitals</label>
                      <input name="nearbyHospitals" value={formData.nearbyHospitals} onChange={handleInputChange} type="text" placeholder="e.g. Nairobi Hospital" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <input type="checkbox" id="petFriendlyManager" checked={formData.petFriendly} onChange={(e) => setFormData({...formData, petFriendly: e.target.checked})} style={{ width: '1.25rem', height: '1.25rem' }} />
                      <label htmlFor="petFriendlyManager" style={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Pet Friendly Property?</label>
                    </div>
                  </div>

                {/* Grid for Type & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Property Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', backgroundColor: 'white' }}>
                      <option value="single_room">Single Room</option>
                      <option value="bedsitter">Bedsitter</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="airbnb">Airbnb / Short Stay</option>
                      <option value="land">Land</option>
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

                {/* Media Links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>YouTube Video URL</label>
                    <input name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} type="url" placeholder="e.g. https://youtube.com..." style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>3D Virtual Tour URL</label>
                    <input name="virtualTourUrl" value={formData.virtualTourUrl} onChange={handleInputChange} type="url" placeholder="e.g. https://my.matterport.com..." style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>TikTok Video URL</label>
                    <input name="tiktokUrl" value={formData.tiktokUrl} onChange={handleInputChange} type="url" placeholder="e.g. https://tiktok.com/@..." style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.75rem 2rem', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? (editingPropertyId ? "Updating..." : "Publishing...") : (editingPropertyId ? "Update Property" : "Publish Listing")}
                  </button>
                  {editingPropertyId && (
                    <button type="button" onClick={() => {
                      setEditingPropertyId(null);
                      setFormData({ title: "", location: "", price: "", type: "apartment", status: "FOR_RENT", description: "", beds: "", baths: "", latitude: "", longitude: "", videoUrl: "", virtualTourUrl: "", tiktokUrl: "", transitScore: "", walkability: "", nearbyPlaces: "", nearbySchools: "", nearbyHospitals: "", deposit: "", waterBill: "", electricity: "", parking: "", petFriendly: false });
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
                          
                          {inquiry.isTourRequest && (
                            <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                              🗓️ Tour Request: {inquiry.tourDate ? new Date(inquiry.tourDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date not specified'}
                            </div>
                          )}

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
                    <div key={property.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'white' }}>
                      <div style={{ width: '150px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={property.images && property.images.length > 0 ? property.images[0] : "/prop-modern.png"} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 5, left: 5, padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '4px' }}>
                          {property.status.replace('_', ' ')}
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{property.title}</h3>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{property.location}</div>
                              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>{property.price}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--color-surface-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Views</span>
                                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy)' }}>{property.views || 0}</span>
                              </div>
                              <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }}></div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Saves</span>
                                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ef4444' }}>{property.saves || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                          <button onClick={() => {
                            setEditingPropertyId(property.id);
                            setFormData({
                              title: property.title || "",
                              location: property.location || "",
                              price: property.price || "",
                              type: property.type?.toLowerCase() || "apartment",
                              status: property.status || "FOR_RENT",
                              description: property.description || "",
                              beds: property.beds?.toString() || "",
                              baths: property.baths?.toString() || "",
                              latitude: property.latitude?.toString() || "",
                              longitude: property.longitude?.toString() || "",
                              videoUrl: property.videoUrl || "",
                              virtualTourUrl: property.virtualTourUrl || "",
                              tiktokUrl: property.tiktokUrl || "",
                              transitScore: property.transitScore || "",
                              walkability: property.walkability || "",
                              nearbyPlaces: property.nearbyPlaces || "",
                              nearbySchools: property.nearbySchools || "",
                              nearbyHospitals: property.nearbyHospitals || "",
                              deposit: property.deposit || "",
                              waterBill: property.waterBill || "",
                              electricity: property.electricity || "",
                              parking: property.parking || "",
                              petFriendly: property.petFriendly || false,
                            });
                            setUploadedImageUrls(property.images || []);
                            setActiveTab("add_property");
                          }} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                            Edit
                          </button>
                          <Link href={`/properties/${property.id}`} target="_blank" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>View Live</Link>
                          {(property.status === "FOR_RENT" || property.status === "FOR_SALE" || property.status === "SHORT_TERM") ? (
                            <button onClick={() => handleToggleStatus(property.id, property.status)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', backgroundColor: '#f59e0b', color: 'white', border: 'none' }}>
                              Mark as Taken
                            </button>
                          ) : (
                            <button onClick={() => handleToggleStatus(property.id, property.status)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none' }}>
                              Mark as Available
                            </button>
                          )}
                          <button onClick={() => handleDeleteProperty(property.id)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- BILLING TAB --- */}
        {activeTab === "billing" && (
          <div className="card animate-fade-in" style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>Upgrade Your Agency</h1>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>Choose a premium plan to unlock unlimited listings, verified badges, and priority support.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Premium Plan */}
              <div style={{ border: '2px solid var(--color-primary)', borderRadius: '16px', padding: '2rem', position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-primary)', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>MOST POPULAR</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>Agent Premium</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-navy)' }}>
                  KES 2,500 <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Unlimited Property Listings</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified Agent Blue Checkmark</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Priority Search Ranking</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Direct M-Pesa API Integration</li>
                </ul>
                <button onClick={() => handleSubscribe("PREMIUM", 2500)} style={{ padding: '1rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  Pay with Paystack
                </button>
              </div>

              {/* Agency Pro Plan */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-secondary)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>Agency Pro</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-navy)' }}>
                  KES 10,000 <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Everything in Premium</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Up to 10 Sub-Agents</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Featured Company Banner</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> 24/7 Dedicated Support</li>
                </ul>
                <button onClick={() => handleSubscribe("PRO", 10000)} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-primary)', backgroundColor: 'transparent', color: 'var(--color-primary)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', width: '100%', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  Upgrade to Pro
                </button>
              </div>

            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <h1 className="heading-2" style={{ marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Agent Profile</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Update your public profile and social media links.</p>
            
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Social Media Links</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Add your social media profiles so clients can easily find you. These will be displayed on your agent profile page.
              </p>

              {profileSuccessMessage && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{profileSuccessMessage}</div>}
              {profileErrorMessage && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{profileErrorMessage}</div>}

              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Agency/Agent Logo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {profileData.logoUrl ? (
                      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-primary)' }}>
                        <img src={profileData.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => setProfileData(p => ({...p, logoUrl: ""}))} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface-secondary)', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                    )}
                    <div>
                      <label htmlFor="logo-upload" className="btn btn-outline" style={{ cursor: isUploading ? 'wait' : 'pointer', opacity: isUploading ? 0.6 : 1, padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        {isUploading ? "Uploading..." : "Upload Logo"}
                      </label>
                      <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} style={{ display: 'none' }} />
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Recommended: Square image, max 2MB.</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Facebook URL</label>
                  <input 
                    type="url" 
                    value={profileData.facebookUrl} 
                    onChange={e => setProfileData({...profileData, facebookUrl: e.target.value})} 
                    placeholder="https://facebook.com/yourpage" 
                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>X (Twitter) URL</label>
                  <input 
                    type="url" 
                    value={profileData.twitterUrl} 
                    onChange={e => setProfileData({...profileData, twitterUrl: e.target.value})} 
                    placeholder="https://x.com/yourhandle" 
                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Instagram URL</label>
                  <input 
                    type="url" 
                    value={profileData.instagramUrl} 
                    onChange={e => setProfileData({...profileData, instagramUrl: e.target.value})} 
                    placeholder="https://instagram.com/yourhandle" 
                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>LinkedIn URL</label>
                  <input 
                    type="url" 
                    value={profileData.linkedinUrl} 
                    onChange={e => setProfileData({...profileData, linkedinUrl: e.target.value})} 
                    placeholder="https://linkedin.com/in/yourprofile" 
                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%' }}
                  />
                </div>
                
                <button type="submit" disabled={isUpdatingProfile} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', marginTop: '1rem' }}>
                  {isUpdatingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
