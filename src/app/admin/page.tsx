"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Authentication Check (Allow only if logged in, ideally we'd check role === 'ADMIN' too)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAgents();
      fetchStats();
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
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        
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

            <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', border: '1px solid #334155', overflow: 'hidden' }}>
              {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading agents from database...</div>
              ) : agents.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No agents found on the platform yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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

      </main>
    </div>
  );
}
