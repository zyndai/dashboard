"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Copy, Check, Key, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAgentById } from "@/apis/registry";
import { Agent, VCResponse } from "@/apis/registry/types";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";
import { CredentialCard } from "@/components/dashboard/credential-card";

const AGENT_TABS = [
  { label: "Overview", value: "overview" },
  { label: "Metadata", value: "metadata" },
  { label: "Credentials", value: "credentials" },
];

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
      className="cursor-pointer rounded p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#E0E7FF]/40 transition-colors hover:bg-white/5 hover:text-[#8B5CF6]"
    >
      {copied ? (
        <Check className="h-4 w-4 text-[#8B5CF6]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

function TruncatedText({ text, maxLength = 20 }: { text: string; maxLength?: number }) {
  if (!text) return null;

  const truncated =
    text.length > maxLength
      ? `${text.substring(0, maxLength)}...${text.substring(text.length - 8)}`
      : text;

  return <span className="font-mono text-sm text-[#E0E7FF]">{truncated}</span>;
}

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentCredentials, setAgentCredentials] = useState<VCResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { registryToken: accessToken, user } = useAuth();

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
        const { agent, credentials } = await getAgentById(agentId!, accessToken!);
        setAgent(agent);
        setAgentCredentials(credentials);
      } catch (err) {
        setError("Failed to load agent details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [agentId, accessToken]);

  const handleDelete = async () => {
    if (!agentId) return;

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete agent");
      }

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

  if (error || !agent || !agentId) {
    return (
      <div className="py-16 text-center">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-8 text-red-400">
          {error || "Agent not found"}
        </div>
        <button
          onClick={() => router.push("/dashboard/agents")}
          className="mt-4 cursor-pointer rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#E0E7FF]/60 transition-colors hover:text-[#E0E7FF]"
        >
          Return to Agent List
        </button>
      </div>
    );
  }

  const isOwner =
    user?.walletAddress.toLowerCase() ===
    agent.owner.walletAddress.toLowerCase();

  const getStatusVariant = (
    status: string
  ): "active" | "inactive" | "deprecated" => {
    switch (status) {
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
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#E0E7FF]">
              {agent.name}
            </h2>
            <Badge variant={getStatusVariant(agent.status)}>
              {agent.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[#E0E7FF]/40">ID: {agentId}</p>
        </div>
        <div className="flex gap-3">
          {isOwner && (
            <Link href={`/dashboard/agents/${agentId}/edit`}>
              <button className="flex cursor-pointer items-center gap-2 rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#E0E7FF] transition-colors hover:bg-white/10">
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </Link>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled
            className="flex cursor-not-allowed items-center gap-2 rounded border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <Tabs tabs={AGENT_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "overview" && (
          <div className="rounded-lg border border-white/10 bg-[#ffffff0d]">
            <div className="border-b border-white/10 px-4 sm:px-6 py-4">
              <h3 className="text-lg font-medium text-[#E0E7FF]">
                Agent Details
              </h3>
            </div>
            <div className="divide-y divide-white/5 px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0 py-4">
                <dt className="sm:col-span-3 text-sm font-medium text-[#E0E7FF]/50">
                  DID
                </dt>
                <dd className="sm:col-span-9 flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2 overflow-hidden">
                  <TruncatedText text={agent.didIdentifier} maxLength={30} />
                  <CopyButton text={agent.didIdentifier} />
                </dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
                <dt className="sm:col-span-3 text-sm font-medium text-[#E0E7FF]/50">
                  Description
                </dt>
                <dd className="sm:col-span-9 text-sm text-[#E0E7FF]">
                  {agent.description || (
                    <span className="italic text-[#E0E7FF]/30">
                      No description provided
                    </span>
                  )}
                </dd>
              </div>
              {agent.seed && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
                  <dt className="sm:col-span-3 text-sm font-medium text-[#E0E7FF]/50">
                    Seed
                  </dt>
                  <dd className="sm:col-span-9 text-sm text-[#E0E7FF]">
                    {agent.seed}
                  </dd>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
                <dt className="sm:col-span-3 text-sm font-medium text-[#E0E7FF]/50">
                  Status
                </dt>
                <dd className="sm:col-span-9">
                  <Badge variant={getStatusVariant(agent.status)}>
                    {agent.status}
                  </Badge>
                </dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-0 py-4">
                <dt className="sm:col-span-3 text-sm font-medium text-[#E0E7FF]/50">
                  Capabilities
                </dt>
                <dd className="sm:col-span-9">
                  {Object.entries(agent.capabilities || {}).length === 0 ? (
                    <span className="text-sm italic text-[#E0E7FF]/30">
                      No capabilities defined
                    </span>
                  ) : (
                    Object.entries(agent.capabilities!).map(
                      ([category, items]) => (
                        <div key={category} className="mb-3 last:mb-0">
                          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#E0E7FF]/40">
                            {category}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {items?.map((item) => (
                              <Badge
                                key={`${category}-${item}`}
                                variant="active"
                              >
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  )}
                </dd>
              </div>
            </div>
          </div>
        )}

        {activeTab === "metadata" && (
          <div className="py-8 text-center text-[#E0E7FF]/40">
            Metadata management coming soon.
          </div>
        )}

        {activeTab === "credentials" && (
          <div className="space-y-6">
            {agentCredentials.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-[#ffffff0d] p-4 sm:p-8 text-center">
                <Key className="mx-auto mb-4 h-12 w-12 text-[#E0E7FF]/20" />
                <h3 className="text-lg font-medium text-[#E0E7FF]/60">
                  No credentials found
                </h3>
                <p className="mt-1 text-sm text-[#E0E7FF]/30">
                  This agent doesn&apos;t have any credentials yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {agentCredentials.map((credential, index) => (
                  <CredentialCard
                    key={credential.id ?? index}
                    credential={credential}
                    index={index}
                    isDID={false}
                  />
                ))}
                <CredentialCard
                  key="did-card"
                  credential={JSON.parse(agent.did)}
                  index={agentCredentials.length + 1}
                  isDID={true}
                />
              </div>
            )}
          </div>
        )}
      </Tabs>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Agent?"
      >
        <p className="text-sm text-[#E0E7FF]/60">
          This action cannot be undone. This will permanently delete the agent
          &ldquo;{agent.name}&rdquo; and all associated metadata.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="cursor-pointer rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#E0E7FF] transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="cursor-pointer rounded bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Dialog>
    </div>
  );
}
