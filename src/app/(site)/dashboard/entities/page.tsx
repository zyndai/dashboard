"use client";

import { useState } from "react";
import Link from "next/link";
import { useEntities } from "@/hooks/useEntities";

export default function EntitiesPage() {
  const { entities, loading, error } = useEntities();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = (entities || []).filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.entity_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.fqan || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Entities</h1>
          <p>Manage your registered entities</p>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 24px", borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
        }}>
          <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246, 246, 246, 0.5)" }}>
            Entity Registry
          </span>
          <input
            type="text" placeholder="Search entities..." className="dashboard-input"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "240px", padding: "8px 12px", margin: 0 }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: "32px", height: "32px", border: "2px solid rgba(139, 92, 246, 0.2)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
            <p style={{ marginTop: "16px", color: "rgba(246, 246, 246, 0.6)" }}>Loading entities...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ padding: "32px", border: "1px solid rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.06)", color: "#ef4444", fontSize: "14px" }}>
              {error}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 500, color: "rgba(246, 246, 246, 0.5)", margin: "0 0 8px 0" }}>
              {searchTerm ? "No matching entities found" : "No entities found"}
            </p>
            <p style={{ fontSize: "14px", color: "rgba(246, 246, 246, 0.3)", margin: 0 }}>
              {searchTerm ? "Try a different search term." : "Create an entity to get started."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>FQAN</th>
                  <th>Entity ID</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {filtered.map((entity) => (
                  <tr key={entity.entity_id}>
                    <td>
                      <div style={{ fontWeight: 500, color: "#fff" }}>{entity.name}</div>
                      {entity.summary && (
                        <div style={{ marginTop: "4px", fontSize: "12px", color: "rgba(246, 246, 246, 0.25)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entity.summary}
                        </div>
                      )}
                    </td>
                    <td>
                      {entity.fqan ? (
                        <code style={{ padding: "4px 8px", border: "1px solid rgba(139, 92, 246, 0.2)", backgroundColor: "rgba(139, 92, 246, 0.04)", fontFamily: "monospace", fontSize: "12px", color: "var(--color-accent)" }}>
                          {entity.fqan}
                        </code>
                      ) : <span style={{ fontSize: "12px", color: "rgba(246,246,246,0.25)", fontStyle: "italic" }}>—</span>}
                    </td>
                    <td>
                      <code style={{ padding: "4px 8px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)", fontFamily: "monospace", fontSize: "12px", color: "rgba(246, 246, 246, 0.5)" }}>
                        {entity.entity_id ? `${entity.entity_id.substring(0, 18)}...` : "—"}
                      </code>
                    </td>
                    <td>
                      <span className={`dashboard-badge ${entity.status.toUpperCase() === "ACTIVE" ? "badge-active" : entity.status.toUpperCase() === "INACTIVE" ? "badge-inactive" : "badge-pending"}`}>
                        {entity.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {entity.tags && entity.tags.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {entity.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="dashboard-badge badge-active" style={{ fontSize: "9px", padding: "2px 6px" }}>{tag}</span>
                          ))}
                          {entity.tags.length > 2 && (
                            <span className="dashboard-badge" style={{ fontSize: "9px", padding: "2px 6px", backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(246, 246, 246, 0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                              +{entity.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : <span style={{ fontSize: "12px", fontStyle: "italic", color: "rgba(246, 246, 246, 0.3)" }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <Link href={`/dashboard/entities/${entity.entity_id}`} className="dashboard-button-secondary" style={{ padding: "6px 12px", fontSize: "12px", textDecoration: "none", borderRadius: "4px" }}>
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
