"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EntityFormProps {
  entity?: { name: string; description: string; tags?: string[] };
  isEditing?: boolean;
  entityId?: string;
}

export function EntityForm({ entity, isEditing = false, entityId }: EntityFormProps) {
  const router = useRouter();
  const { authenticated } = useAuth();
  const [name, setName] = useState(entity?.name ?? "");
  const [description, setDescription] = useState(entity?.description ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(entity?.tags ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) { setTags((p) => [...p, trimmed]); setTagInput(""); }
  };
  const removeTag = (tag: string) => setTags((p) => p.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Entity name is required."); return; }
    if (!authenticated) { setError("Not authenticated."); return; }

    try {
      setSubmitting(true);
      const supabase = createClient();
      if (isEditing && entityId) {
        const { error: err } = await supabase.from("entities").update({ name: name.trim(), description: description.trim() || null, tags: tags.length > 0 ? tags : null, updated_at: new Date().toISOString() }).eq("id", entityId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("entities").insert({ name: name.trim(), description: description.trim() || null, tags: tags.length > 0 ? tags : null, status: "active" });
        if (err) throw err;
      }
      router.push("/dashboard/entities");
    } catch (err) { console.error(err); setError("Failed to save entity. Please try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      <div className="dashboard-header">
        <div>
          <h1>{isEditing ? "Edit Entity" : "Create Entity"}</h1>
          <p>{isEditing ? "Update entity details" : "Register a new entity"}</p>
        </div>
      </div>

      <div className="dashboard-card">
        {error && (
          <div style={{ marginBottom: "20px", padding: "12px 16px", border: "1px solid rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.06)", fontSize: "13px", color: "#ef4444", borderRadius: "6px" }}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="dashboard-form-group">
            <label className="dashboard-label">Name *</label>
            <input className="dashboard-input" type="text" placeholder="My Entity" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="dashboard-form-group">
            <label className="dashboard-label">Description</label>
            <textarea className="dashboard-input" placeholder="What does this entity do?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ resize: "vertical" }} />
          </div>
          <div className="dashboard-form-group">
            <label className="dashboard-label">Tags</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input className="dashboard-input" type="text" placeholder="e.g. text-generation" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} style={{ flex: 1 }} />
              <button type="button" onClick={addTag} className="dashboard-button-secondary" style={{ whiteSpace: "nowrap", padding: "8px 16px", borderRadius: "6px" }}>+ Add</button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                {tags.map((tag) => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "4px", fontSize: "11px", fontWeight: 600, color: "var(--color-accent)", textTransform: "uppercase" }}>
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(139, 92, 246, 0.5)", fontSize: "14px", padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px", paddingTop: "16px" }}>
            <button type="button" onClick={() => router.back()} style={{ padding: "10px 20px", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", color: "#fff", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={submitting} className="dashboard-button" style={{ opacity: submitting ? 0.5 : 1 }}>{submitting ? "Saving..." : isEditing ? "Update Entity" : "Create Entity"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
