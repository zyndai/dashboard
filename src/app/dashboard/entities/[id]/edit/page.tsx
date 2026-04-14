"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { EntityRecord } from "@/lib/supabase/db";
import { EntityForm } from "@/components/entities/entity-form";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditEntityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [entity, setEntity] = useState<EntityRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const { authenticated } = useAuth();

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setEntityId(resolvedParams.id);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!entityId || !authenticated) return;

    async function fetchEntity() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("entities")
          .select("*")
          .eq("id", entityId!)
          .single();

        if (fetchError) throw fetchError;
        setEntity(data);
      } catch (err) {
        setError("Failed to load entity details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEntity();
  }, [entityId, authenticated]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="py-16 text-center">
        <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-8 text-red-400">
          {error || "Entity not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EntityForm
        entity={{
          name: entity.name,
          description: entity.description ?? "",
          tags: entity.tags ?? [],
        }}
        isEditing={true}
        entityId={entityId!}
      />
    </div>
  );
}
