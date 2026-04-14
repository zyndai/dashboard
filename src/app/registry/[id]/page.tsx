"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  Globe,
  Copy,
  Check,
  Send,
  Loader2,
  Calendar,
  User,
  Hash,
  AlertCircle,
  Linkedin,
  Github,
  Shield,
  FileSearch,
  BarChart3,
  Workflow,
  Brain,
  Code,
  Scale,
  Eye,
  Zap,
  Database,
  Network,
  Scan,
  Award,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { wrapFetchWithPayment, type Signer } from "x402-fetch";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { AccentCorners } from "@/components/ui/AccentCorners";
import { GridTripod } from "@/components/ui/GridTripod";
import { formatAddress } from "@/lib/utils";

type AgentStatus = "ACTIVE" | "INACTIVE" | "DEPRECATED";

interface Agent {
  id: string;
  name: string;
  description?: string;
  capabilities?: Record<string, string[]>;
  status: AgentStatus;
  createdAt: string;
  owner: { walletAddress: string };
  did: string;
  didIdentifier: string;
  httpWebhookUrl: string;
}

async function getAgentByIdPublic(_id: string): Promise<Agent | null> {
  // TODO: Connect to AgentDNS registry
  return null;
}

const ICON_COLORS = [
  "#8B5CF6", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6",
  "#06B6D4", "#F97316", "#10B981", "#6366F1", "#EF4444",
];

function getAgentIcon(name: string): { Icon: LucideIcon; color: string } {
  const lower = name.toLowerCase();
  if (lower.includes("linkedin")) return { Icon: Linkedin, color: "#0A66C2" };
  if (lower.includes("github")) return { Icon: Github, color: "#8B5CF6" };
  if (lower.includes("passport") || lower.includes("credential")) return { Icon: Shield, color: "#F59E0B" };
  if (lower.includes("ats") || lower.includes("screen")) return { Icon: Scan, color: "#EC4899" };
  if (lower.includes("skill")) return { Icon: Award, color: "#06B6D4" };
  if (lower.includes("bias")) return { Icon: Scale, color: "#EF4444" };
  if (lower.includes("orchestrat")) return { Icon: Workflow, color: "#F97316" };
  if (lower.includes("match")) return { Icon: Network, color: "#10B981" };
  if (lower.includes("codeforce") || lower.includes("leetcode") || lower.includes("code")) return { Icon: Code, color: "#3B82F6" };
  if (lower.includes("rank")) return { Icon: BarChart3, color: "#8B5CF6" };
  if (lower.includes("explain")) return { Icon: Eye, color: "#F59E0B" };
  if (lower.includes("research") || lower.includes("search")) return { Icon: FileSearch, color: "#06B6D4" };
  if (lower.includes("data")) return { Icon: Database, color: "#10B981" };
  if (lower.includes("ai") || lower.includes("agent")) return { Icon: Brain, color: "#8B5CF6" };
  const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const icons: LucideIcon[] = [Brain, Zap, Bot, FileSearch, Database, Network, Workflow, BarChart3];
  return { Icon: icons[hash % icons.length], color: ICON_COLORS[hash % ICON_COLORS.length] };
}

function statusToBadgeVariant(
  status: string
): "active" | "inactive" | "deprecated" {
  switch (status) {
    case "ACTIVE": return "active";
    case "INACTIVE": return "inactive";
    case "DEPRECATED": return "deprecated";
    default: return "inactive";
  }
}

/* Override the landing-page layout props that break standalone usage */
const wrapStyle: React.CSSProperties = {
  position: "relative",
  top: "auto",
  padding: 0,
};
const cardStyle: React.CSSProperties = {
  display: "block",
  gridTemplateColumns: "none",
  minHeight: "auto",
  gap: 0,
  padding: 0,
  position: "relative",
  zIndex: 5,
  backgroundColor: "transparent",
  border: "none",
  borderRadius: 0,
};

function DetailSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="solution-card-wrap" style={wrapStyle}>
        <div className="solution-card" style={{ ...cardStyle, padding: "2rem" }}>
          <div className="flex items-start gap-5">
            <Skeleton className="size-16 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
        <div className="accent-border-overlay" />
        <div className="accent-background" />
      </div>
    </div>
  );
}

export default function AgentDetailPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const params = useParams();
  const isConnected = false; // TODO: Reconnect wallet support
  const walletClient: unknown = null;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("0.01");

  useEffect(() => {
    const entityId = typeof params.id === "string" ? params.id : "";
    if (!entityId) {
      setError("Agent not found");
      setLoading(false);
      return;
    }

    // Try sessionStorage first (populated when navigating from the registry list)
    try {
      const cached = sessionStorage.getItem(`agent_${entityId}`);
      if (cached) {
        setAgent(JSON.parse(cached) as Agent);
        setLoading(false);
        return;
      }
    } catch {
      // sessionStorage unavailable, fall through to API
    }

    getAgentByIdPublic(entityId)
      .then((data) => {
        if (data) setAgent(data);
        else setError("Agent not found");
      })
      .catch((err) => {
        console.error("Error fetching agent:", err);
        setError("Failed to load agent");
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;
    if (!agent?.httpWebhookUrl) {
      setResponse(JSON.stringify({ error: "No HTTP endpoint available for this agent" }, null, 2));
      return;
    }
    if (!isConnected || !walletClient) {
      setResponse(JSON.stringify({ error: "Please connect your wallet first" }, null, 2));
      return;
    }

    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setResponse(JSON.stringify({ error: "Enter a valid payment amount" }, null, 2));
      return;
    }

    setIsSubmitting(true);
    setResponse(null);

    try {
      const amountInBaseUnits = BigInt(Math.floor(parsedAmount * 1_000_000));
      const fetchWithPay = wrapFetchWithPayment(
        fetch,
        walletClient as unknown as Signer,
        amountInBaseUnits
      );

      const apiResponse = await fetchWithPay(agent.httpWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await apiResponse.json();
      setResponse(JSON.stringify({ status: apiResponse.status, statusText: apiResponse.statusText, data }, null, 2));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error calling agent:", err);
      setResponse(JSON.stringify({ error: "Agent offline", details: message }, null, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCapabilities = agent?.capabilities
    ? Object.entries(agent.capabilities).filter(([, values]) => values && values.length > 0)
    : [];

  const agentIcon = agent ? getAgentIcon(agent.name) : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black">
        <div className="padding-global">
          <div className="container">
            <div className="relative" style={{ paddingTop: "1.5rem", paddingBottom: "4rem" }}>

              <Link
                href="/registry"
                className="group relative mb-8 inline-flex items-center gap-3 overflow-hidden border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)]"
              >
                <span className="absolute inset-0 bg-[var(--color-accent)]/0 transition-all group-hover:bg-[var(--color-accent)]/[0.04]" />
                <ArrowLeft className="relative h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                <span className="relative font-mono text-xs uppercase tracking-widest">Registry</span>
                <span className="pointer-events-none absolute left-0 top-0 h-1.5 w-1.5 border-l border-t border-white/20 transition-colors group-hover:border-[var(--color-accent)]/50" />
                <span className="pointer-events-none absolute right-0 top-0 h-1.5 w-1.5 border-r border-t border-white/20 transition-colors group-hover:border-[var(--color-accent)]/50" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-white/20 transition-colors group-hover:border-[var(--color-accent)]/50" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-white/20 transition-colors group-hover:border-[var(--color-accent)]/50" />
              </Link>

              {loading && <DetailSkeleton />}

              {!loading && error && (
                <div className="solution-card-wrap" style={wrapStyle}>
                  <div className="solution-card" style={{ ...cardStyle, padding: "3rem", textAlign: "center" }}>
                    <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
                    <p className="text-lg text-red-400">{error}</p>
                    <Link href="/registry" className="mt-4 inline-block text-sm text-[var(--color-accent)] hover:underline">
                      Return to Registry
                    </Link>
                  </div>
                  <div className="accent-border-overlay" />
                  <div className="accent-background" />
                </div>
              )}

              {!loading && !error && agent && agentIcon && (
                <div className="space-y-0">

                  {/* ── Hero Card ── */}
                  <div className="solution-card-wrap" style={wrapStyle}>
                    <div className="solution-card" style={cardStyle}>
                      <div style={{ padding: "2rem 2.5rem" }}>
                        <div className="flex flex-col sm:flex-row items-start gap-5">
                          <div
                            className="flex size-[72px] shrink-0 items-center justify-center rounded-2xl border"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${agentIcon.color} 10%, transparent)`,
                              borderColor: `color-mix(in srgb, ${agentIcon.color} 20%, transparent)`,
                              boxShadow: `0 0 30px color-mix(in srgb, ${agentIcon.color} 7%, transparent)`,
                            }}
                          >
                            <agentIcon.Icon className="size-9" style={{ color: agentIcon.color }} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-2xl font-bold text-white">{agent.name}</p>
                              <Badge variant={statusToBadgeVariant(agent.status)}>
                                {agent.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                              {agent.description || "No description available"}
                            </p>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { icon: Hash, label: "Decentralized ID", value: agent.did || "Unavailable", accent: "139, 92, 246" },
                            { icon: User, label: "Owner", value: agent.owner?.walletAddress ? formatAddress(agent.owner.walletAddress, 6, 4) : "Unknown", accent: "59, 130, 246" },
                            { icon: Calendar, label: "Registered", value: new Date(agent.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }), accent: "16, 185, 129" },
                          ].map((meta) => (
                            <div
                              key={meta.label}
                              className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                              style={{ backgroundColor: `rgba(${meta.accent}, 0.04)`, border: `1px solid rgba(${meta.accent}, 0.1)` }}
                            >
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `rgba(${meta.accent}, 0.08)` }}>
                                <meta.icon className="h-4 w-4" style={{ color: `rgb(${meta.accent})` }} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] font-medium uppercase tracking-wider text-white/40">{meta.label}</div>
                                <div className="mt-0.5 truncate text-sm font-medium text-white/90" title={meta.value}>{meta.value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="accent-border-overlay" />
                    <div className="accent-background" />
                    <div className="events-none absolute">
                      <AccentCorners />
                    </div>
                    <GridTripod corner="left-top-corner" />
                    <GridTripod corner="right-top-corner" />
                    <GridTripod corner="left-bottom-corner" />
                    <GridTripod corner="right-bottom-corner" />
                    <div className="main-hero-bottom-line" />
                    <div className="main-hero-top-line" />
                  </div>

                  {/* ── Capabilities ── */}
                  {allCapabilities.length > 0 && (
                    <div className="solution-card-wrap" style={wrapStyle}>
                      <div className="solution-card" style={cardStyle}>
                        <div style={{ padding: "2rem 2.5rem" }}>
                          <div className="mb-5 flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                              <Zap className="size-4 text-[var(--color-accent)]" />
                            </div>
                            <p className="text-base font-semibold text-white/90">Capabilities</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allCapabilities.map(([category, capabilities]) => (
                              <div key={category} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]" style={{ opacity: 0.7 }}>
                                  {category.replace(/_/g, " ")}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {capabilities?.map((cap, idx) => (
                                    <span
                                      key={`${cap}-${idx}`}
                                      className="inline-flex items-center rounded-lg border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.07] px-3 py-1.5 text-[12px] font-medium text-[#8B5CF6]"
                                    >
                                      {cap}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="accent-border-overlay" />
                      <div className="accent-background" />
                      <div className="events-none absolute">
                        <AccentCorners />
                      </div>
                      <GridTripod corner="left-top-corner" />
                      <GridTripod corner="right-top-corner" />
                      <GridTripod corner="left-bottom-corner" />
                      <GridTripod corner="right-bottom-corner" />
                      <div className="middle-hero-second-line" />
                      <div className="middle-hero-right-second-line" />
                    </div>
                  )}

                  {/* ── HTTP Endpoint ── */}
                  <div className="solution-card-wrap" style={wrapStyle}>
                    <div className="solution-card" style={cardStyle}>
                      <div style={{ padding: "2rem 2.5rem" }}>
                        <div className="mb-5 flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                            <Globe className="size-4 text-[var(--color-accent)]" />
                          </div>
                          <p className="text-base font-semibold text-white/90">HTTP Endpoint</p>
                        </div>

                        <div className="group relative flex items-center">
                          <input
                            type="text"
                            readOnly
                            value={agent.httpWebhookUrl || "No endpoint provided"}
                            className="w-full rounded-lg border border-white/[0.08] bg-black/40 py-3.5 pl-4 pr-14 font-mono text-sm text-white/70 outline-none"
                          />
                          <button
                            onClick={() => agent.httpWebhookUrl && copyToClipboard(agent.httpWebhookUrl)}
                            disabled={!agent.httpWebhookUrl}
                            className="absolute right-2 flex size-9 items-center justify-center rounded border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                          >
                            {copied ? <Check className="h-4 w-4 text-[var(--color-accent)]" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>

                        {agent.httpWebhookUrl && (
                          <a
                            href={agent.httpWebhookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open in browser
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="accent-border-overlay" />
                    <div className="accent-background" />
                    <div className="events-none absolute">
                      <AccentCorners />
                    </div>
                  </div>

                  {/* ── Execution Engine ── */}
                  <div className="solution-card-wrap" style={wrapStyle}>
                    <div className="solution-card" style={cardStyle}>
                      <div style={{ padding: "2rem 2.5rem" }}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                              <Send className="size-4 text-[var(--color-accent)]" />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-white/90">Execution Engine</p>
                              <p className="text-sm text-white/40">
                                Send requests with x402 micropayments.
                              </p>
                            </div>
                          </div>
                          {/* Wallet connection removed — PKI auth coming soon */}
                        </div>

                        {!isConnected && (
                          <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400/80" />
                            <div>
                              <p className="text-sm font-medium text-yellow-400/90">Wallet Required</p>
                              <p className="mt-1 text-sm text-yellow-400/60">
                                Connect your wallet to send micropayments to this agent.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 border-t border-white/[0.06] pt-6 lg:grid-cols-2">
                          {/* Inputs */}
                          <div className="space-y-5">
                            <div>
                              <label htmlFor="amount" className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/50">
                                Max Payment (USDC)
                              </label>
                              <div className="relative">
                                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#8B5CF6]/40">$</div>
                                <input
                                  id="amount"
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  className="w-full rounded-lg border border-white/[0.08] bg-black/40 py-3.5 pl-9 pr-4 font-mono text-sm text-white/80 outline-none transition-colors focus:border-[var(--color-accent)]/40"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="prompt" className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-white/50">
                                <span>Payload</span>
                                <span className="rounded border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 px-2 py-0.5 font-mono text-[10px] text-[var(--color-accent)]">JSON or Text</span>
                              </label>
                              <textarea
                                id="prompt"
                                rows={5}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="What would you like the agent to do?"
                                className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-4 text-sm text-white/80 outline-none transition-colors placeholder:text-white/20 focus:border-[var(--color-accent)]/40"
                              />
                            </div>

                            <button
                              onClick={handleSubmitPrompt}
                              disabled={!prompt.trim() || isSubmitting || !isConnected}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 sm:w-auto sm:px-8"
                            >
                              {isSubmitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Executing...</>
                              ) : (
                                <><Send className="h-4 w-4" /> Execute & Pay</>
                              )}
                            </button>
                          </div>

                          {/* Terminal */}
                          <div className="overflow-hidden rounded-lg border border-white/[0.06]" style={{ background: "#0a0a0a", minHeight: "260px" }}>
                            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5" style={{ background: "#0f0f0f" }}>
                              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                              <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                              <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                              <span className="ml-3 font-mono text-[11px] tracking-wider text-white/25">response</span>
                            </div>
                            {response ? (
                              <pre className="max-h-[400px] overflow-y-auto whitespace-pre-wrap p-5 font-mono text-[13px] leading-relaxed text-[var(--color-accent)]">
                                {response}
                              </pre>
                            ) : (
                              <div className="flex min-h-[200px] items-center justify-center p-8">
                                <div className="text-center">
                                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-white/[0.04]">
                                    <Send className="h-4 w-4 text-white/15" />
                                  </div>
                                  <p className="text-sm text-white/20">Response will appear here</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accent-border-overlay" />
                    <div className="accent-background" />
                    <div className="events-none absolute">
                      <AccentCorners />
                    </div>
                    <GridTripod corner="left-top-corner" />
                    <GridTripod corner="right-top-corner" />
                    <GridTripod corner="left-bottom-corner" />
                    <GridTripod corner="right-bottom-corner" />
                    <div className="main-hero-bottom-line" />
                    <div className="main-hero-top-line" />
                    <div className="middle-hero-second-line" />
                    <div className="middle-hero-right-second-line" />
                  </div>

                </div>
              )}

              {/* Page-level grid decoration */}
              <div className="middle-hero-right-second-line is-hide-mb" />
              <div className="middle-hero-second-line is-hide-mb" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
