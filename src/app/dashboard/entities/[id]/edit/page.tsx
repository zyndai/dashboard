"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { EntityRecord } from "@/lib/supabase/db";
import { EntityForm } from "@/components/entities/entity-form";

export default function EditEntityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [entity, setEntity] = useState<EntityRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const { authenticated } = useAuth();

  useEffect(() => { params.then((p) => setEntityId(p.id)); }, [params]);

  useEffect(() => {
    if (!entityId || !authenticated) return;
    (async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error: fetchError } = await supabase.from("entities").select("*").eq("id", entityId!).single();
        if (fetchError) throw fetchError;
        setEntity(data);
      } catch { setError("Failed to load entity details"); }
      finally { setLoading(false); }
    })();
  }, [entityId, authenticated]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: "32px", height: "32px", border: "2px solid rgba(139, 92, 246, 0.2)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ padding: "32px", border: "1px solid rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.06)", color: "#ef4444", fontSize: "14px" }}>{error || "Entity not found"}</div>
          <button onClick={() => router.push("/dashboard/entities")} style={{ marginTop: "16px", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(246, 246, 246, 0.5)", cursor: "pointer" }}>Return to Entity List</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <EntityForm entity={{ name: entity.name, description: entity.description ?? "", tags: entity.tags ?? [] }} isEditing entityId={entityId!} />
    </div>
  );
}
