"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Copy, Check } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";

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

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { agents, loading: agentsLoading, error: agentsError, refresh } = useAgents();

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setAgentId(resolvedParams.id);
    }
    resolveParams();
  }, [params]);

  const agent = useMemo(() => {
    if (!agentId) return null;
    return agents.find((a) => a.id === agentId) ?? null;
  }, [agents, agentId]);

  const loading = !agentId || (agentsLoading && agents.length === 0);

  const handleDelete = async () => {
    if (!agentId) return;
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await refresh();
      router.push("/dashboard/agents");
    } catch (err) {
      console.error("Error deleting agent:", err);
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

  if (agentsError || !agent || !agentId) {
    return (
      <div className="py-16 text-center">
        <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-8 text-red-400">
          {agentsError || "Agent not found"}
        </div>
        <button
          onClick={() => router.push("/dashboard/agents")}
          className="mt-4 cursor-pointer border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          Return to Agent List
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
              {agent.name}
            </h2>
            <Badge variant={getStatusVariant(agent.status)}>
              {agent.status.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-1 text-xs font-mono text-white/30">
            {agent.agent_id || agentId}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/agents/${agentId}/edit`}>
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
            Agent Details
          </h3>
        </div>
        <div className="divide-y divide-white/[0.05] px-5">
          {agent.agent_id && (
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Agent ID</dt>
              <dd className="sm:col-span-9 flex items-center justify-between border border-white/10 bg-white/5 px-3 py-2 overflow-hidden">
                <span className="font-mono text-sm text-white truncate">{agent.agent_id}</span>
                <CopyButton text={agent.agent_id} />
              </dd>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
            <dt className="sm:col-span-3 text-sm text-white/40">Description</dt>
            <dd className="sm:col-span-9 text-sm text-white">
              {agent.description || (
                <span className="italic text-white/25">No description provided</span>
              )}
            </dd>
          </div>
          {agent.agent_url && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Agent URL</dt>
              <dd className="sm:col-span-9 text-sm text-white break-all">{agent.agent_url}</dd>
            </div>
          )}
          {agent.category && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Category</dt>
              <dd className="sm:col-span-9 text-sm text-white">{agent.category}</dd>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
            <dt className="sm:col-span-3 text-sm text-white/40">Status</dt>
            <dd className="sm:col-span-9">
              <Badge variant={getStatusVariant(agent.status)}>
                {agent.status.toUpperCase()}
              </Badge>
            </dd>
          </div>
          {agent.tags && agent.tags.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
              <dt className="sm:col-span-3 text-sm text-white/40">Tags</dt>
              <dd className="sm:col-span-9 flex flex-wrap gap-1.5">
                {agent.tags.map((tag) => (
                  <Badge key={tag} variant="active">{tag}</Badge>
                ))}
              </dd>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Agent?"
      >
        <p className="text-sm text-white/50">
          This action cannot be undone. This will permanently delete the agent
          &ldquo;{agent.name}&rdquo;.
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
