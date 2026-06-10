"use client";

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

export default function AdminZyndUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) { setError("Failed to load users."); setLoading(false); return; }
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      } catch { setError("Failed to load users."); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.username ?? "").toLowerCase().includes(q) || u.country.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const totalAgents = users.reduce((sum, u) => sum + u.agentCount, 0);
  const countries = new Set(users.map((u) => u.country).filter((c) => c !== "—"));

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(91,124,250,0.2)", borderTop: "2px solid #5b7cfa", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", textAlign: "center", borderRadius: 8 }}>
        <p style={{ fontSize: 14, color: "#ef4444", margin: 0 }}>{error}</p>
      </div>
    );
  }

  const card: React.CSSProperties = { padding: 20, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", borderRadius: 8 };
  const cell: React.CSSProperties = { padding: "10px 12px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.04)" };
  const head: React.CSSProperties = { ...cell, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.5)", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Users</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Registered developers + agents.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Total Users", value: total },
          { label: "Total Agents", value: totalAgents },
          { label: "Countries", value: countries.size },
        ].map((s) => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#5b7cfa" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by name, email, username, country, or role…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 14, borderRadius: 6 }}
      />

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={head}>User</th>
                <th style={head}>Email</th>
                <th style={head}>Username</th>
                <th style={head}>Role</th>
                <th style={head}>Country</th>
                <th style={head}>Agents</th>
                <th style={head}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ ...cell, textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 32 }}>{search ? "No users match your search." : "No users found."}</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id}>
                  <td style={cell}>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{u.developerId.slice(0, 12)}…</div>
                  </td>
                  <td style={{ ...cell, color: "rgba(255,255,255,0.7)" }}>{u.email}</td>
                  <td style={{ ...cell, fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>{u.username ?? "—"}</td>
                  <td style={cell}>{u.role}</td>
                  <td style={{ ...cell, color: "rgba(255,255,255,0.7)" }}>{u.country}</td>
                  <td style={{ ...cell, fontWeight: 700, color: u.agentCount > 0 ? "#5b7cfa" : "rgba(255,255,255,0.3)" }}>{u.agentCount}</td>
                  <td style={{ ...cell, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Showing {filtered.length} of {total} users</p>
    </div>
  );
}
