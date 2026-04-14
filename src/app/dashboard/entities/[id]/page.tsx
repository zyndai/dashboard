"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";

interface EntityDetail {
  id: string;
  user_id: string;
  entity_id: string | null;
  name: string;
  description: string | null;
  entity_url: string | null;
  category: string | null;
  tags: string[] | null;
  summary: string | null;
  entity_index: number | null;
  fqan: string | null;
  developer_handle: string | null;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  public_key: string | null;
  trust_score: number | null;
  developer_id: string | null;
  home_registry: string | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="cursor-pointer p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/30 transition-colors hover:text-[var(--color-accent)]"
    >
      {copied ? (
        <Check className="h-4 w-4 text-[var(--color-accent)]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

export default function EntityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
        const res = await fetch(`/api/entities/${entityId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load entity");
        }
        const { entity: entityData } = await res.json();
        setEntity(entityData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load entity details"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEntity();
  }, [entityId, authenticated]);

  const handleDelete = async () => {
    if (!entityId) return;
    try {
      const supabase = createClient();
      await supabase.from("entities").delete().eq("id", entityId);
      router.push("/dashboard/entities");
    } catch (err) {
      console.error("Error deleting entity:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !entity || !entityId) {
    return (
      <div className="py-16 text-center">
        <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-8 text-red-400">
          {error || "Entity not found"}
        </div>
        <button
          onClick={() => router.push("/dashboard/entities")}
          className="mt-4 cursor-pointer border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          Return to Entity List
        </button>
      </div>
    );
  }

  const getStatusVariant = (
    status: string
  ): "active" | "inactive" | "deprecated" => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "active";
      case "INACTIVE":
        return "inactive";
      default:
        return "deprecated";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {entity.name}
            </h2>
            <Badge variant={getStatusVariant(entity.status)}>
              {entity.status.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-1 text-xs font-mono text-white/30">
            {entity.entity_id || entityId}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/entities/${entityId}/edit`}>
            <button className="flex cursor-pointer items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/[0.06]">
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex cursor-pointer items-center gap-2 border border-red-500/15 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/[0.06]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="rounded border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-white/50">
            Entity Details
          </h3>
        </div>
        <div className="divide-y divide-white/[0.05] px-5">
          {entity.fqan && (
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">FQAN</dt>
              <dd className="sm:col-span-9 flex items-center justify-between border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04] px-3 py-2 overflow-hidden">
                <span className="font-mono text-sm text-[var(--color-accent)] truncate">{entity.fqan}</span>
                <CopyButton text={entity.fqan} />
              </dd>
            </div>
          )}
          {entity.entity_id && (
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Entity ID</dt>
              <dd className="sm:col-span-9 flex items-center justify-between border border-white/10 bg-white/5 px-3 py-2 overflow-hidden">
                <span className="font-mono text-sm text-white truncate">{entity.entity_id}</span>
                <CopyButton text={entity.entity_id} />
              </dd>
            </div>
          )}
          {entity.developer_handle && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Developer</dt>
              <dd className="sm:col-span-9 text-sm text-white font-mono">@{entity.developer_handle}</dd>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
            <dt className="sm:col-span-3 text-sm text-white/40">Description</dt>
            <dd className="sm:col-span-9 text-sm text-white">
              {entity.description || entity.summary || (
                <span className="italic text-white/25">No description provided</span>
              )}
            </dd>
          </div>
          {entity.entity_url && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Entity URL</dt>
              <dd className="sm:col-span-9 text-sm text-white break-all">{entity.entity_url}</dd>
            </div>
          )}
          {entity.category && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Category</dt>
              <dd className="sm:col-span-9 text-sm text-white">{entity.category}</dd>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
            <dt className="sm:col-span-3 text-sm text-white/40">Status</dt>
            <dd className="sm:col-span-9">
              <Badge variant={getStatusVariant(entity.status)}>
                {entity.status.toUpperCase()}
              </Badge>
            </dd>
          </div>
          {entity.tags && entity.tags.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Tags</dt>
              <dd className="sm:col-span-9 flex flex-wrap gap-1.5">
                {entity.tags.map((tag) => (
                  <Badge key={tag} variant="active">{tag}</Badge>
                ))}
              </dd>
            </div>
          )}
          {entity.home_registry && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Registry</dt>
              <dd className="sm:col-span-9 text-sm text-white/60 font-mono">{entity.home_registry}</dd>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Entity?"
      >
        <p className="text-sm text-white/50">
          This action cannot be undone. This will permanently delete the entity
          &ldquo;{entity.name}&rdquo;.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="cursor-pointer border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="cursor-pointer bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Dialog>
    </div>
  );
}
