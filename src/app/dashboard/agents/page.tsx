"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Eye, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMyAgents } from "@/apis/registry";
import { Agent, Capabilities } from "@/apis/registry/types";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { registryToken: accessToken } = useAuth();

  useEffect(() => {
    async function fetchAgents() {
      try {
        setLoading(true);
        const response = await getMyAgents(accessToken!);
        setAgents(response);
        setError(null);
      } catch (err) {
        setError("Failed to load agents");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      fetchAgents();
    }
  }, [accessToken]);

  const filteredAgents = (agents || []).filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.didIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCapabilities = (capabilities?: Capabilities) => {
    if (!capabilities || Object.keys(capabilities).length === 0) {
      return (
        <span className="text-xs italic text-[#E0E7FF]/30">
          No capabilities
        </span>
      );
    }

    const allItems = Object.values(capabilities).flat().filter(Boolean) as string[];

    return (
      <div className="flex flex-wrap gap-1">
        {allItems.slice(0, 2).map((item, idx) => (
          <Badge key={idx} variant="active" className="text-[9px]">
            {item}
          </Badge>
        ))}
        {allItems.length > 2 && (
          <Badge variant="default" className="text-[9px]">
            +{allItems.length - 2} more
          </Badge>
        )}
      </div>
    );
  };

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#E0E7FF]">
            Agents
          </h2>
          <p className="mt-1 text-[#E0E7FF]/50">Manage your Zynd agents</p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#ffffff0d]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center">
          <h3 className="text-lg font-medium text-[#E0E7FF]">
            Agent Registry
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#E0E7FF]/30" />
            <Input
              placeholder="Search agents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-4 sm:p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 sm:p-6 text-center">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-8 text-red-400">
              {error}
            </div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-4 sm:p-8 text-center">
            <p className="text-lg font-medium text-[#E0E7FF]/60">
              {searchTerm ? "No matching agents found" : "No agents found"}
            </p>
            <p className="mt-1 text-sm text-[#E0E7FF]/30">
              {searchTerm
                ? "Try a different search term."
                : "Register agents using the Python SDK or N8N nodes."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 cursor-pointer rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#E0E7FF]/60 transition-colors hover:text-[#E0E7FF]"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table headers={["Name", "DID", "Status", "Capabilities", "Actions"]}>
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td>
                    <div className="font-medium text-[#E0E7FF]">{agent.name}</div>
                    <div className="mt-0.5 text-xs text-[#E0E7FF]/30">
                      ID: {agent.id}
                    </div>
                  </td>
                  <td>
                    <code className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-[#E0E7FF]/60">
                      {agent.didIdentifier.substring(0, 18)}...
                    </code>
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(agent.status)}>
                      {agent.status}
                    </Badge>
                  </td>
                  <td>{renderCapabilities(agent.capabilities)}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/agents/${agent.id}`}>
                        <button className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded border border-[#8B5CF6]/20 bg-transparent px-3 py-1.5 text-xs text-[#8B5CF6] transition-colors hover:bg-[#8B5CF6]/10">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </Link>
                      <Link href={`/dashboard/agents/${agent.id}/edit`}>
                        <button className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded border border-white/10 bg-transparent px-3 py-1.5 text-xs text-[#E0E7FF]/60 transition-colors hover:text-[#E0E7FF]">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
