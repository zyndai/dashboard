"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAgentById } from "@/apis/registry";
import { Agent } from "@/apis/registry/types";
import { AgentForm } from "@/components/agents/agent-form";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const { registryToken: accessToken } = useAuth();

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setAgentId(resolvedParams.id);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!agentId || !accessToken) return;

    async function fetchAgent() {
      try {
        setLoading(true);
        const result = await getAgentById(agentId!, accessToken!);
        setAgent(result.agent);
      } catch (err) {
        setError("Failed to load agent details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [agentId, accessToken]);

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
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-8 text-red-400">
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
          capabilities: agent.capabilities,
        }}
        isEditing={true}
      />
    </div>
  );
}
