"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ExternalLink, Copy, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";

interface ZNSName {
  fqan: string;
  entity_name: string;
  developer_handle: string;
  registry_host: string;
  entity_id: string;
  developer_id: string;
  current_version?: string;
  capability_tags?: string[];
  registered_at: string;
  updated_at: string;
  signature: string;
}

interface ZNSResolveResponse {
  fqan: string;
  entity_id: string;
  developer_id: string;
  developer_handle: string;
  registry_host: string;
  version?: string;
  entity_url: string;
  public_key: string;
  protocols?: string[];
  trust_score: number;
  verification_tier?: string;
  status: string;
}

export default function NamesPage() {
  const { authenticated } = useAuth();
  const [names, setNames] = useState<ZNSName[]>([]);
  const [handle, setHandle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Resolve dialog
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<ZNSName | null>(null);
  const [resolveResult, setResolveResult] = useState<ZNSResolveResponse | null>(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Copy state
  const [copiedFQAN, setCopiedFQAN] = useState<string | null>(null);

  const fetchNames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/zns/names");
      if (res.ok) {
        const data = await res.json();
        setNames(data.names ?? []);
        setHandle(data.handle ?? null);
        setError(null);
      } else {
        const d = await res.json();
        setError(d.error || "Failed to load names");
      }
    } catch (err) {
      setError("Failed to load names");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchNames();
  }, [authenticated, fetchNames]);

  const filteredNames = names.filter(
    (n) =>
      n.fqan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleResolve(name: ZNSName) {
    setResolveTarget(name);
    setResolveResult(null);
    setResolveError(null);
    setResolveDialogOpen(true);
    setResolveLoading(true);

    try {
      const res = await fetch(
        `/api/zns/resolve?developer=${encodeURIComponent(name.developer_handle)}&entity=${encodeURIComponent(name.entity_name)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setResolveError(data.error || "Failed to resolve");
      } else {
        setResolveResult(data);
      }
    } catch {
      setResolveError("Failed to resolve name");
    } finally {
      setResolveLoading(false);
    }
  }

  async function handleCopyFQAN(fqan: string) {
    try {
      await navigator.clipboard.writeText(fqan);
      setCopiedFQAN(fqan);
      setTimeout(() => setCopiedFQAN(null), 2000);
    } catch {
      /* ignore */
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Names</h2>
        <p className="mt-1 text-sm text-white/40">
          ZNS agent name bindings registered under your handle
        </p>
      </div>

      {handle && (
        <div className="grid grid-cols-1 gap-px sm:grid-cols-3 border border-white/10 bg-white/10">
          <StatCard label="Handle" value={`@${handle}`} />
          <StatCard label="Total Names" value={String(names.length)} />
          <StatCard
            label="Registered"
            value={names.length > 0 ? formatDate(names[0].registered_at) : "—"}
          />
        </div>
      )}

      <div className="rounded border border-white/10 bg-white/[0.02]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-3 sm:flex-row sm:items-center">
          <h3 className="text-sm font-medium uppercase tracking-wider text-white/50">
            Name Registry
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search names..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="p-5 text-center">
            <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-8 text-red-400">
              {error}
            </div>
          </div>
        ) : filteredNames.length === 0 ? (
          <div className="p-5 sm:p-10 text-center">
            <p className="text-base font-medium text-white/50">
              {searchTerm ? "No matching names found" : "No names registered yet"}
            </p>
            <p className="mt-1 text-sm text-white/30">
              {searchTerm
                ? "Try a different search term."
                : handle
                ? "Register an agent name binding via the agent-dns CLI."
                : "Claim a handle first, then register agent names."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 cursor-pointer border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table headers={["FQAN", "Agent Name", "Entity ID", "Version", "Updated", "Actions"]}>
              {filteredNames.map((name) => (
                <tr key={name.fqan} className="transition-colors hover:bg-white/[0.02]">
                  <td>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-[var(--color-accent)] truncate max-w-[200px]">
                        {name.fqan}
                      </code>
                      <button
                        onClick={() => handleCopyFQAN(name.fqan)}
                        className="shrink-0 cursor-pointer text-white/25 transition-colors hover:text-white/60"
                        title="Copy FQAN"
                      >
                        {copiedFQAN === name.fqan ? (
                          <CheckCheck className="h-3.5 w-3.5 text-[#00FF66]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-white">{name.entity_name}</div>
                  </td>
                  <td>
                    <code className="border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-xs text-white/50">
                      {name.entity_id ? `${name.entity_id.substring(0, 18)}...` : "—"}
                    </code>
                  </td>
                  <td>
                    {name.current_version ? (
                      <Badge variant="default">{name.current_version}</Badge>
                    ) : (
                      <span className="text-xs italic text-white/25">—</span>
                    )}
                  </td>
                  <td>
                    <span className="text-sm text-white/40">{formatDate(name.updated_at)}</span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleResolve(name)}
                        className="flex min-h-[44px] cursor-pointer items-center gap-1.5 border border-[var(--color-accent)]/20 bg-transparent px-3 py-1.5 text-xs text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/[0.06]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Resolve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => { setResolveDialogOpen(false); setResolveResult(null); setResolveError(null); }}
        title="Resolve Name"
        className="max-w-xl"
      >
        {resolveTarget && (
          <div className="space-y-4">
            <div className="border border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <div className="text-[11px] uppercase tracking-wider text-white/30 mb-1">FQAN</div>
              <code className="font-mono text-sm text-[var(--color-accent)] break-all">
                {resolveTarget.fqan}
              </code>
            </div>

            {resolveLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : resolveError ? (
              <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
                {resolveError}
              </div>
            ) : resolveResult ? (
              <div className="divide-y divide-white/[0.05]">
                <ResolveRow label="Entity ID" value={resolveResult.entity_id} mono />
                <ResolveRow label="Status" value={resolveResult.status} />
                {resolveResult.version && (
                  <ResolveRow label="Version" value={resolveResult.version} />
                )}
                {resolveResult.entity_url && (
                  <ResolveRow label="Entity URL" value={resolveResult.entity_url} mono />
                )}
                <ResolveRow label="Developer" value={resolveResult.developer_handle} />
                <ResolveRow label="Registry" value={resolveResult.registry_host} />
                <ResolveRow
                  label="Trust Score"
                  value={resolveResult.trust_score?.toFixed(3) ?? "—"}
                />
                {resolveResult.verification_tier && (
                  <ResolveRow label="Verification" value={resolveResult.verification_tier} />
                )}
                {resolveResult.protocols && resolveResult.protocols.length > 0 && (
                  <ResolveRow label="Protocols" value={resolveResult.protocols.join(", ")} />
                )}
              </div>
            ) : null}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-center bg-[#0a0a0a] p-5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-0.5 truncate text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function ResolveRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-3">
      <span className="text-xs text-white/40 shrink-0 sm:w-28">{label}</span>
      <span
        className={`break-all text-xs sm:text-right ${
          mono ? "font-mono text-white/60" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
