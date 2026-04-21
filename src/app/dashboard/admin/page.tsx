"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  userId: string;
  developerId: string;
  name: string;
  username: string | null;
  email: string;
  role: string;
  country: string;
  agentCount: number;
  createdAt: string;
}

export default function AdminPage() {
  const { authenticated } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.status === 403) { setError("You do not have admin access."); setLoading(false); return; }
        if (!res.ok) { setError("Failed to load users."); setLoading(false); return; }
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      } catch { setError("Failed to load users."); }
      finally { setLoading(false); }
    })();
  }, [authenticated]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.username ?? "").toLowerCase().includes(q) || u.country.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const totalAgents = users.reduce((sum, u) => sum + u.agentCount, 0);
  const countries = new Set(users.map((u) => u.country).filter((c) => c !== "—"));

  if (loading) {
    return (
      <div className="dashboard-page" style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid rgba(139, 92, 246, 0.2)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div style={{ padding: "32px", border: "1px solid rgba(239, 68, 68, 0.3)", backgroundColor: "rgba(239, 68, 68, 0.05)", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#ef4444", margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div><h1>Admin Panel</h1><p>Overview of all registered users and their activity</p></div>
      </div>

      <div className="dashboard-grid-3col">
        {[
          { label: "Total Users", value: total },
          { label: "Total Agents", value: totalAgents },
          { label: "Countries", value: countries.size },
        ].map((stat) => (
          <div key={stat.label} className="dashboard-card stats-card">
            <div className="stats-value" style={{ color: "var(--color-accent)" }}>{stat.value}</div>
            <div className="stats-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <input type="text" placeholder="Search by name, email, username, country, or role..." value={search} onChange={(e) => setSearch(e.target.value)} className="dashboard-input" style={{ width: "100%" }} />
      </div>

      <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dashboard-table">
            <thead>
              <tr><th>User</th><th>Email</th><th>Username</th><th>Role</th><th>Country</th><th>Agents</th><th>Registered</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "rgba(246, 246, 246, 0.3)" }}>{search ? "No users match your search." : "No users found."}</td></tr>
              ) : filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>{user.name}</div>
                    <div style={{ fontSize: "12px", color: "rgba(246, 246, 246, 0.3)", fontFamily: "monospace" }}>{user.developerId.slice(0, 12)}...</div>
                  </td>
                  <td style={{ fontSize: "14px", color: "rgba(246, 246, 246, 0.7)" }}>{user.email}</td>
                  <td style={{ fontSize: "14px", fontFamily: "monospace", color: "rgba(246, 246, 246, 0.7)" }}>{user.username ?? "—"}</td>
                  <td><span className="dashboard-badge badge-pending">{user.role}</span></td>
                  <td style={{ fontSize: "14px", color: "rgba(246, 246, 246, 0.7)" }}>{user.country}</td>
                  <td><span style={{ fontSize: "14px", fontWeight: 700, color: user.agentCount > 0 ? "var(--color-accent)" : "rgba(246, 246, 246, 0.3)" }}>{user.agentCount}</span></td>
                  <td style={{ fontSize: "12px", color: "rgba(246, 246, 246, 0.4)" }}>{new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "rgba(246, 246, 246, 0.3)", marginTop: "16px" }}>Showing {filtered.length} of {total} users</p>
    </div>
  );
}
