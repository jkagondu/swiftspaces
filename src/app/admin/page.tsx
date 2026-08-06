"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminPropertyForm from "@/components/AdminPropertyForm";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  // Property management state
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(false);

  // Platform settings state
  const [settings, setSettings] = useState({ 
    supportEmail: "", 
    supportPhone: "",
    siteName: "",
    maintenanceMode: false,
    allowAgentRegistration: true,
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: ""
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Strict Authentication & Authorization Check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const user = session?.user as any;
      if (user?.role !== "ADMIN") {
        // Redirect non-admins away from the admin portal
        router.push("/manager");
      }
    }
  }, [status, router, session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAgents();
      fetchStats();
      fetchProperties();
      fetchLogs();
      fetchSettings();
    }
  }, [status]);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Failed to fetch agents", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchProperties = async () => {
    setIsLoadingProps(true);
    try {
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setIsLoadingProps(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({ 
          supportEmail: data.supportEmail || "", 
          supportPhone: data.supportPhone || "",
          siteName: data.siteName || "",
          maintenanceMode: data.maintenanceMode || false,
          allowAgentRegistration: data.allowAgentRegistration ?? true,
          facebookUrl: data.facebookUrl || "",
          instagramUrl: data.instagramUrl || "",
          twitterUrl: data.twitterUrl || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Platform settings updated successfully!");
        fetchLogs(); // refresh logs to show the update action
      } else {
        alert("Failed to update settings.");
      }
    } catch (error) {
      console.error("Failed to update settings", error);
      alert("Error updating settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProperties(properties.filter(p => p.id !== id));
        fetchStats(); // Update stats
      }
    } catch (error) {
      console.error("Failed to delete property", error);
    }
  };

  const handleToggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/properties/feature`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, isFeatured: !currentStatus })
      });
      if (res.ok) {
        setProperties(properties.map(p => p.id === id ? { ...p, isFeatured: !currentStatus } : p));
      }
    } catch (error) {
      console.error("Failed to toggle feature status", error);
    }
  };

  const handleUpdateStatus = async (agentId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, newStatus }),
      });

      if (res.ok) {
        // Optimistically update the UI
        setAgents(prev => prev.map((agent: any) => 
          agent.id === agentId ? { ...agent, agentStatus: newStatus } : agent
        ));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleVerifyAgent = async (agentId: string, isVerified: boolean) => {
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, isVerified }),
      });

      if (res.ok) {
        setAgents(prev => prev.map((agent: any) => 
          agent.id === agentId ? { ...agent, isVerified } : agent
        ));
        if (selectedAgent && selectedAgent.id === agentId) {
          setSelectedAgent({ ...selectedAgent, isVerified });
        }
      } else {
        alert("Failed to update verification status");
      }
    } catch (error) {
      console.error("Error updating verification:", error);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>Loading...</div>;
  }

  // Calculate stats from real data
  const totalAgents = agents.length;
  const pendingAgents = agents.filter(a => a.agentStatus === "PENDING").length;
  const activeAgents = agents.filter(a => a.agentStatus === "ACTIVE").length;
  const totalProperties = stats?.totalProperties ?? "...";
  const totalInquiries = stats?.totalInquiries ?? "...";

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
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

      {/* Sidebar - Dark Theme for Super Admin */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`} style={{ width: '280px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155' }}>
          <div className="logo" style={{ color: 'white' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            SwiftSpaces
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 }}>SUPER ADMIN</div>
        </div>
        
        <nav style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "overview" ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: activeTab === "overview" ? 'var(--color-primary)' : '#cbd5e1',
              fontWeight: activeTab === "overview" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            System Overview
          </button>
          <button 
            onClick={() => { setActiveTab("agents"); setIsSidebarOpen(false); }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "agents" ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: activeTab === "agents" ? 'var(--color-primary)' : '#cbd5e1',
              fontWeight: activeTab === "agents" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Manage Agents
            </div>
            {pendingAgents > 0 && (
              <span style={{ background: '#ef4444', color: 'white', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                {pendingAgents}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => { setActiveTab("properties"); setIsSidebarOpen(false); }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "properties" ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: activeTab === "properties" ? 'var(--color-primary)' : '#cbd5e1',
              fontWeight: activeTab === "properties" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Manage Properties
          </button>
          
          <button 
            onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              backgroundColor: activeTab === "settings" ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: activeTab === "settings" ? 'var(--color-primary)' : '#cbd5e1',
              fontWeight: activeTab === "settings" ? 600 : 400,
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Platform Settings
          </button>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              SA
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>System Admin</div>
              <button onClick={() => signOut()} style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main" style={{ flex: 1, overflowY: 'auto' }}>
        
        {activeTab === "overview" && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', letterSpacing: '-0.02em' }}>Platform Overview</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Registered Agents</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>{totalAgents}</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Agents</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{activeAgents}</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pending Approvals</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b' }}>{pendingAgents}</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Listings</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#a78bfa' }}>{totalProperties}</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Inquiries</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#38bdf8' }}>{totalInquiries}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Recent Property Listings */}
              <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid #334155' }}>
                <h2 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontWeight: 600, color: 'white' }}>🏠 Recent Listings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(stats?.recentProperties ?? []).length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No listings yet.</p>
                  ) : (
                    stats?.recentProperties.map((p: any) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', marginTop: '6px', flexShrink: 0 }}></div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.25rem' }}>
                            <strong style={{ color: 'white' }}>{p.title}</strong> in <strong style={{ color: 'white' }}>{p.location}</strong>
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>by {p.agent?.agencyName || 'Agent'} · {new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Recent Inquiries */}
              <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid #334155' }}>
                <h2 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontWeight: 600, color: 'white' }}>💬 Recent Inquiries</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(stats?.recentInquiries ?? []).length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No inquiries yet.</p>
                  ) : (
                    stats?.recentInquiries.map((inq: any) => (
                      <div key={inq.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8', marginTop: '6px', flexShrink: 0 }}></div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.25rem' }}>
                            <strong style={{ color: 'white' }}>{inq.customerName}</strong> inquired about <strong style={{ color: 'white' }}>{inq.property?.title || 'a property'}</strong>
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(inq.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Agent Management</h1>
            </div>

            <div className="table-container" style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', border: '1px solid #334155', overflowX: 'auto' }}>
              {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading agents from database...</div>
              ) : agents.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No agents found on the platform yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>Agency / Contact</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>Email</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>Active Listings</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent: any) => (
                      <tr key={agent.id} style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{agent.agencyName || "Agent"}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{agent.phoneNumber || "No phone"}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>{agent.email}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>{agent._count?.properties || 0}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {agent.agentStatus === "ACTIVE" && <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Active</span>}
                          {agent.agentStatus === "PENDING" && <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Pending</span>}
                          {agent.agentStatus === "SUSPENDED" && <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Suspended</span>}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedAgent(agent)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8' }}>Details</button>
                            {agent.agentStatus !== "ACTIVE" && (
                              <button onClick={() => handleUpdateStatus(agent.id, "ACTIVE")} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}>Approve</button>
                            )}
                            {agent.agentStatus === "ACTIVE" && (
                              <button onClick={() => handleUpdateStatus(agent.id, "SUSPENDED")} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>Suspend</button>
                            )}
                            {agent.agentStatus === "PENDING" && (
                              <button onClick={() => handleUpdateStatus(agent.id, "SUSPENDED")} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569' }}>Reject</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "properties" && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Listing Moderation</h1>
              <button 
                onClick={() => setActiveTab("add_property")}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add New Property
              </button>
            </div>

            <div className="table-container" style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', border: '1px solid #334155', overflowX: 'auto' }}>
              {isLoadingProps ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading properties from database...</div>
              ) : properties.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No properties found on the platform yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>Property Details</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>Agent</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>Price & Type</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center' }}>Featured</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property: any) => (
                      <tr key={property.id} style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{property.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{property.location}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                          {property.agent?.agencyName || "Unknown"}
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{property.agent?.email}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                          <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{property.price}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>{property.type}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                           <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                             {property.status.replace('_', ' ')}
                           </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleToggleFeature(property.id, property.isFeatured)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                            title={property.isFeatured ? "Unfeature" : "Feature on Homepage"}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={property.isFeatured ? "#fbbf24" : "none"} stroke={property.isFeatured ? "#fbbf24" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                          </button>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Link href={`/properties/${property.id}`} target="_blank" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'transparent', color: '#cbd5e1', borderColor: '#475569' }}>
                              View
                            </Link>
                            <button onClick={() => handleDeleteProperty(property.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* --- ADD PROPERTY TAB --- */}
        {activeTab === "add_property" && (
          <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={() => setActiveTab("properties")} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back
              </button>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Add New Property</h1>
            </div>
            <AdminPropertyForm onComplete={() => {
              fetchProperties();
              fetchStats();
              setActiveTab("properties");
            }} />
          </div>
        )}

        {/* --- ACTIVITY LOGS TAB --- */}
        {activeTab === "logs" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                System Activity Logs
              </h2>
              <button onClick={fetchLogs} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                Refresh
              </button>
            </div>

            <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0f172a' }}>
                      <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.2s', backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0f172a'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem', 
                            fontWeight: 600,
                            backgroundColor: log.action.includes('CREATED') ? 'rgba(16, 185, 129, 0.1)' : log.action.includes('DELETED') || log.action.includes('SUSPENDED') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                            color: log.action.includes('CREATED') ? '#10b981' : log.action.includes('DELETED') || log.action.includes('SUSPENDED') ? '#ef4444' : '#38bdf8'
                          }}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: 'white', fontSize: '0.875rem' }}>
                          {log.details}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                          {log.user?.agencyName || log.user?.email || "System"}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          No activity logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === "settings" && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Platform Settings</h1>
            </div>

            <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', border: '1px solid #334155', padding: '2rem', maxWidth: '800px' }}>
              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* General Settings */}
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600, color: 'white', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>General Settings</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label htmlFor="siteName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Site Name</label>
                      <input 
                        type="text" 
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Support Contact */}
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600, color: 'white', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>Global Contact Details</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label htmlFor="supportEmail" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Support Email Address</label>
                      <input 
                        type="email" 
                        id="supportEmail"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="supportPhone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Support Phone Number</label>
                      <input 
                        type="tel" 
                        id="supportPhone"
                        value={settings.supportPhone}
                        onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600, color: 'white', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>Social Media Links</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label htmlFor="facebookUrl" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Facebook URL (Optional)</label>
                      <input 
                        type="url" 
                        id="facebookUrl"
                        value={settings.facebookUrl}
                        onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="twitterUrl" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Twitter URL (Optional)</label>
                      <input 
                        type="url" 
                        id="twitterUrl"
                        value={settings.twitterUrl}
                        onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="instagramUrl" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Instagram URL (Optional)</label>
                      <input 
                        type="url" 
                        id="instagramUrl"
                        value={settings.instagramUrl}
                        onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Controls */}
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600, color: 'white', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>Advanced Controls</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={settings.allowAgentRegistration}
                        onChange={(e) => setSettings({ ...settings, allowAgentRegistration: e.target.checked })}
                        style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'white' }}>Allow New Agent Registrations</div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>If disabled, new agents cannot sign up for the platform.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        style={{ width: '1.25rem', height: '1.25rem', accentColor: '#ef4444' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#ef4444' }}>Enable Maintenance Mode</div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Shows a maintenance page to all regular users. Admins can still log in.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button 
                    type="submit" 
                    disabled={isSavingSettings}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      borderRadius: 'var(--radius-md)', 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'white', 
                      border: 'none', 
                      fontWeight: 600, 
                      cursor: isSavingSettings ? 'not-allowed' : 'pointer',
                      opacity: isSavingSettings ? 0.7 : 1
                    }}
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#1e293b', zIndex: 10 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Agent Details</h2>
              <button onClick={() => setSelectedAgent(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em' }}>Profile Info</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div><strong style={{ color: '#cbd5e1' }}>Agency Name:</strong> {selectedAgent.agencyName || "N/A"}</div>
                    <div><strong style={{ color: '#cbd5e1' }}>Email:</strong> {selectedAgent.email}</div>
                    <div><strong style={{ color: '#cbd5e1' }}>Phone:</strong> {selectedAgent.phoneNumber || "N/A"}</div>
                    <div><strong style={{ color: '#cbd5e1' }}>Joined:</strong> {new Date(selectedAgent.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em' }}>Status & Account</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Status: </strong> 
                      <span style={{ color: selectedAgent.agentStatus === 'ACTIVE' ? '#10b981' : selectedAgent.agentStatus === 'SUSPENDED' ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{selectedAgent.agentStatus}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: '#cbd5e1' }}>Verification: </strong>
                      {selectedAgent.isVerified ? (
                        <span style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#38bdf8" stroke="white" strokeWidth="2"><polygon points="12 2 15.09 5.09 19.5 4.5 21 8.91 24 12 21 15.09 19.5 19.5 15.09 18.91 12 22 8.91 18.91 4.5 19.5 3 15.09 0 12 3 8.91 4.5 4.5 8.91 5.09 12 2"></polygon><polyline points="9 12 11 14 15 10"></polyline></svg>
                          Verified
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Not Verified</span>
                      )}
                      <button 
                        onClick={() => handleVerifyAgent(selectedAgent.id, !selectedAgent.isVerified)}
                        style={{ marginLeft: 'auto', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', backgroundColor: selectedAgent.isVerified ? 'transparent' : '#38bdf8', color: selectedAgent.isVerified ? '#94a3b8' : 'white', border: selectedAgent.isVerified ? '1px solid #475569' : 'none' }}
                      >
                        {selectedAgent.isVerified ? 'Revoke Verification' : 'Verify Agent'}
                      </button>
                    </div>
                    <div><strong style={{ color: '#cbd5e1' }}>Subscription:</strong> {selectedAgent.subscriptionPlan || "FREE_TRIAL"}</div>
                    <div><strong style={{ color: '#cbd5e1' }}>Total Properties:</strong> {selectedAgent._count?.properties || 0}</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>Properties by this Agent</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {properties.filter(p => p.agentId === selectedAgent.id).length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>This agent hasn't posted any properties yet.</p>
                ) : (
                  properties.filter(p => p.agentId === selectedAgent.id).map(p => (
                    <div key={p.id} style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{p.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.price}</div>
                      </div>
                      <Link href={`/properties/${p.id}`} target="_blank" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>View &rarr;</Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
