"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AgentRecord } from "@/lib/supabase/db";
import { AgentForm } from "@/components/agents/agent-form";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const { authenticated } = useAuth();

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setAgentId(resolvedParams.id);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!agentId || !authenticated) return;

    async function fetchAgent() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("agents")
          .select("*")
          .eq("id", agentId!)
          .single();

        if (fetchError) throw fetchError;
        setAgent(data);
      } catch (err) {
        setError("Failed to load agent details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [agentId, authenticated]);

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
