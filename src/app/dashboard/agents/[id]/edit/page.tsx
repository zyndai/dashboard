"use client";

import { useEffect, useMemo, useState } from "react";
import { useAgents } from "@/hooks/useAgents";
import { AgentForm } from "@/components/agents/agent-form";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [agentId, setAgentId] = useState<string | null>(null);
  const { agents, loading: agentsLoading, error } = useAgents();

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="py-16 text-center">
        <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-8 text-red-400">
          {error || "Agent not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AgentForm
        agent={{
          name: agent.name,
          description: agent.description ?? "",
          tags: agent.tags ?? [],
        }}
        isEditing={true}
        agentId={agentId!}
      />
    </div>
  );
}
