"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminPropertyForm({ onComplete }: { onComplete: () => void }) {
  const { data: session } = useSession();

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
    transitScore: "",
    walkability: "",
    nearbyPlaces: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Error uploading images.");
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
      const payload = {
        ...formData,
        type: formData.type.toUpperCase().replace("-", "_"),
        agentId: (session?.user as any)?.id || "mock-admin-id-12345", 
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/prop-2bed.png"]
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save property");
      }

      setSuccessMessage("Property published successfully to the live site!");
      setFormData({
        title: "", location: "", price: "", type: "apartment", status: "FOR_RENT", description: "", beds: "", baths: "", latitude: "", longitude: "", videoUrl: "", virtualTourUrl: "", transitScore: "", walkability: "", nearbyPlaces: ""
      });
      setUploadedImageUrls([]);
      
      setTimeout(() => {
        setSuccessMessage("");
        onComplete();
      }, 2000);
      
    } catch (error) {
      setErrorMessage("Error publishing property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }}>
      {successMessage && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px' }}>
          ✅ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px' }}>
          ❌ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#e2e8f0' }}>
        
        {/* Image Upload Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Property Images</label>
          
          {uploadedImageUrls.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {uploadedImageUrls.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
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
            border: '2px dashed #475569', 
            borderRadius: '12px', 
            padding: '2rem', 
            textAlign: 'center',
            backgroundColor: '#0f172a',
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'white' }}>
              {isUploading ? "Uploading to Cloudinary..." : "Click to upload multiple images"}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Select multiple PNG, JPG, WEBP up to 10MB</div>
          </label>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Property Title</label>
          <input name="title" value={formData.title} onChange={handleInputChange} required type="text" placeholder="e.g. Modern 3-Bedroom Apartment" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
        </div>

        {/* Grid for Price & Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Location / Address</label>
            <input name="location" value={formData.location} onChange={handleInputChange} required type="text" placeholder="e.g. Kileleshwa, Nairobi" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Price</label>
            <input name="price" value={formData.price} onChange={handleInputChange} required type="text" placeholder="e.g. Ksh 40,000 / month" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
          </div>
        </div>

        {/* Grid for Beds & Baths */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Bedrooms</label>
            <input name="beds" value={formData.beds} onChange={handleInputChange} type="number" placeholder="e.g. 2" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Bathrooms</label>
            <input name="baths" value={formData.baths} onChange={handleInputChange} type="number" placeholder="e.g. 1" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
          </div>
        </div>

        {/* Grid for Type & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Property Type</label>
            <select name="type" value={formData.type} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="single-room">Single Room</option>
              <option value="bedsitter">Bedsitter</option>
              <option value="airbnb">Airbnb</option>
              <option value="land">Land</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Listing Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}>
              <option value="FOR_RENT">For Rent</option>
              <option value="FOR_SALE">For Sale</option>
              <option value="SHORT_TERM">Short Term (Airbnb)</option>
            </select>
          </div>
        </div>

        {/* GPS Coordinates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Map Coordinates (Optional)</label>
            <button type="button" onClick={handleGetLocation} style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
              Use My Current Location
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input name="latitude" value={formData.latitude} onChange={handleInputChange} type="text" placeholder="Latitude (e.g. -1.2921)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
            <input name="longitude" value={formData.longitude} onChange={handleInputChange} type="text" placeholder="Longitude (e.g. 36.8219)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
          </div>
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Describe the property, features, rules, etc." style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none', resize: 'vertical' }}></textarea>
        </div>

        {/* Media Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>YouTube Video URL (Optional)</label>
            <input name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} type="url" placeholder="e.g. https://youtube.com/watch?v=..." style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>3D Virtual Tour URL (Optional)</label>
            <input name="virtualTourUrl" value={formData.virtualTourUrl} onChange={handleInputChange} type="url" placeholder="e.g. https://my.matterport.com/show/?m=..." style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || isUploading}
          style={{ 
            marginTop: '1rem',
            padding: '1rem', 
            borderRadius: '8px', 
            backgroundColor: 'var(--color-primary)', 
            color: 'white', 
            border: 'none', 
            fontWeight: 700, 
            fontSize: '1rem',
            cursor: (isSubmitting || isUploading) ? 'not-allowed' : 'pointer',
            opacity: (isSubmitting || isUploading) ? 0.7 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {isSubmitting ? "Publishing..." : "Publish Property"}
        </button>

      </form>
    </div>
  );
}
