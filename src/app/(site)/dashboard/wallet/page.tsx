"use client";

import { useState } from "react";
import { useEntities } from "@/hooks/useEntities";

const MOCK_DEV_WALLET = {
  address: "0x1A2b3C4d5E6f7890aAbBcCdDeEfF00112233445",
  balance_usd: 12.50,
};

const MOCK_BALANCES = [3.10, 0.50, 8.00];

const MOCK_ACTIVITY = [
  { direction: "out" as const, amount_usdc: 5.00, agent: "weather-agent", timestamp: "2026-05-29 14:32" },
  { direction: "out" as const, amount_usdc: 2.30, agent: "summarizer", timestamp: "2026-05-28 18:45" },
  { direction: "in" as const, amount_usdc: 20.00, agent: "Add Balance", timestamp: "2026-05-27 09:11" },
];

const PAGE_SIZE = 5;

function truncateKey(key: string) {
  // strips "ed25519:" prefix then truncates
  const raw = key.startsWith("ed25519:") ? key.slice(8) : key;
  return raw.length > 16 ? `${raw.slice(0, 8)}...${raw.slice(-6)}` : raw;
}

export default function WalletPage() {
  const { entities, loading: entitiesLoading } = useEntities();
  const [topUpAgentId, setTopUpAgentId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(0);

  const totalAgentBalance = entities.reduce((s, _, i) => s + MOCK_BALANCES[i % MOCK_BALANCES.length], 0);
  const activeAgents = entities.filter((e) => e.status.toUpperCase() === "ACTIVE").length;
  const totalPages = Math.ceil(entities.length / PAGE_SIZE);
  const pageEntities = entities.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleCopy() {
    navigator.clipboard.writeText(MOCK_DEV_WALLET.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openTopUp(entityId: string) {
    setTopUpAgentId(entityId);
    setTopUpAmount("");
    setTopUpSuccess(false);
  }

  function handleTransfer() {
    if (!topUpAmount || Number(topUpAmount) <= 0) return;
    setTopUpSuccess(true);
  }

  function closeTopUp() {
    setTopUpAgentId(null);
    setTopUpAmount("");
    setTopUpSuccess(false);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Wallet</h1>
          <p>Overview of your developer wallet and agent balances on Arc Testnet</p>
        </div>
      </div>

      {/* Master wallet card */}
      <div style={{
        padding: "24px 28px",
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        borderRadius: "10px",
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(246,246,246,0.4)", marginBottom: "10px" }}>
              Your Master Wallet · Arc Testnet
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "40px", fontWeight: 700, color: "#fff", letterSpacing: "-1px", lineHeight: 1 }}>
                ${MOCK_DEV_WALLET.balance_usd.toFixed(2)}
              </span>
              <span style={{ fontSize: "14px", color: "rgba(246,246,246,0.4)", fontWeight: 500 }}>USD</span>
            </div>
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <code style={{ fontSize: "12px", fontFamily: "monospace", color: "rgba(246,246,246,0.5)" }}>
                {MOCK_DEV_WALLET.address}
              </code>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" }}>
            <button
              onClick={handleCopy}
              className="dashboard-button-secondary"
              style={{ padding: "9px 16px", fontSize: "12px", fontWeight: 600 }}
            >
              {copied ? "✓ Copied" : "Copy Address"}
            </button>
            <button
              className="dashboard-button"
              style={{ padding: "9px 16px", fontSize: "12px", fontWeight: 600, opacity: 0.5, cursor: "not-allowed" }}
              disabled
            >
              + Add Balance
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Balance", value: `$${MOCK_DEV_WALLET.balance_usd.toFixed(2)}`, sub: "USD in master wallet" },
          { label: "Deployed to Agents", value: `$${totalAgentBalance.toFixed(2)}`, sub: "Across all agent wallets" },
          { label: "Active Agents", value: String(activeAgents), sub: `${entities.length} total` },
        ].map((stat) => (
          <div key={stat.label} className="dashboard-card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246,246,246,0.4)", marginBottom: "10px" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "rgba(246,246,246,0.35)", marginTop: "6px" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Agent wallets + Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", marginBottom: "24px" }}>

        {/* Agent wallets */}
        <div className="dashboard-card" style={{ padding: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(139, 92, 246, 0.1)" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246,246,246,0.5)" }}>Agent Wallets</span>
            <span className="dashboard-badge badge-pending" style={{ fontSize: "10px" }}>{entities.length} agents</span>
          </div>
          {entitiesLoading ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ width: "24px", height: "24px", border: "2px solid rgba(139,92,246,0.2)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : entities.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "rgba(246,246,246,0.35)", fontSize: "13px" }}>
              No agents found. Create an entity to get started.
            </div>
          ) : (
            <>
              <div>
                {pageEntities.map((entity, i) => {
                  const globalIdx = page * PAGE_SIZE + i;
                  const balance = MOCK_BALANCES[globalIdx % MOCK_BALANCES.length];
                  const isActive = entity.status.toUpperCase() === "ACTIVE";
                  const pubKeyDisplay = entity.public_key ? truncateKey(entity.public_key) : null;
                  return (
                    <div key={entity.entity_id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 24px",
                      borderBottom: i < pageEntities.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      gap: "12px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                          background: "rgba(139, 92, 246, 0.15)",
                          border: "1px solid rgba(139, 92, 246, 0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "14px", fontWeight: 700, color: "var(--color-accent)",
                        }}>
                          {entity.name[0].toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {entity.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "rgba(246,246,246,0.35)", marginTop: "2px" }}>
                            {entity.fqan ?? entity.entity_id.substring(0, 20) + "…"}
                          </div>
                          {entity.wallet_address ? (
                            <div style={{ fontSize: "10px", color: "rgba(139,92,246,0.6)", marginTop: "2px", fontFamily: "monospace" }}>
                              {entity.wallet_address.slice(0, 6)}…{entity.wallet_address.slice(-4)}
                            </div>
                          ) : pubKeyDisplay ? (
                            <div style={{ fontSize: "10px", color: "rgba(246,246,246,0.25)", marginTop: "2px", fontFamily: "monospace" }}>
                              {pubKeyDisplay}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                        <span className={`dashboard-badge ${isActive ? "badge-active" : "badge-inactive"}`} style={{ fontSize: "10px" }}>
                          {entity.status.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: "monospace", color: "#00FF66", minWidth: "60px", textAlign: "right" }}>
                          ${balance.toFixed(2)}
                        </span>
                        <button
                          onClick={() => openTopUp(entity.entity_id)}
                          className="dashboard-button-secondary"
                          style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}
                        >
                          ↑ Top Up
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 24px",
                  borderTop: "1px solid rgba(139, 92, 246, 0.1)",
                }}>
                  <span style={{ fontSize: "12px", color: "rgba(246,246,246,0.35)" }}>
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, entities.length)} of {entities.length}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 0}
                      className="dashboard-button-secondary"
                      style={{ padding: "5px 12px", fontSize: "12px", opacity: page === 0 ? 0.3 : 1 }}
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages - 1}
                      className="dashboard-button-secondary"
                      style={{ padding: "5px 12px", fontSize: "12px", opacity: page >= totalPages - 1 ? 0.3 : 1 }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent activity */}
        <div className="dashboard-card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(139, 92, 246, 0.1)" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246,246,246,0.5)" }}>Recent Activity</span>
          </div>
          <div style={{ padding: "0 20px" }}>
            {MOCK_ACTIVITY.map((tx, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < MOCK_ACTIVITY.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                gap: "10px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    backgroundColor: tx.direction === "in" ? "rgba(0,255,102,0.1)" : "rgba(255,184,0,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px",
                  }}>
                    {tx.direction === "in" ? "↓" : "↑"}
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 500, color: "#fff" }}>{tx.agent}</div>
                    <div style={{ fontSize: "10px", color: "rgba(246,246,246,0.35)", marginTop: "2px" }}>{tx.timestamp}</div>
                  </div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "monospace", color: tx.direction === "in" ? "#00FF66" : "#FFB800", flexShrink: 0 }}>
                  {tx.direction === "in" ? "+" : "-"}${tx.amount_usdc.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top-up modal overlay */}
      {topUpAgentId && (() => {
        const agent = entities.find((a) => a.entity_id === topUpAgentId)!;
        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }} onClick={closeTopUp}>
            <div style={{
              background: "#0a0a0a",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "12px",
              padding: "28px",
              width: "100%",
              maxWidth: "400px",
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 600 }}>Top Up Agent</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(246,246,246,0.5)" }}>
                  Transfer USD from your master wallet to <strong style={{ color: "#fff" }}>{agent.name}</strong>
                </p>
                {agent.wallet_address ? (
                  <p style={{ margin: "6px 0 0 0", fontSize: "11px", fontFamily: "monospace", color: "rgba(139,92,246,0.7)" }}>
                    {agent.wallet_address}
                  </p>
                ) : (
                  <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "rgba(246,246,246,0.25)" }}>
                    Wallet address not yet synced
                  </p>
                )}
              </div>

              {topUpSuccess ? (
                <div style={{
                  padding: "16px", borderRadius: "8px",
                  backgroundColor: "rgba(0,255,102,0.08)",
                  border: "1px solid rgba(0,255,102,0.2)",
                  display: "flex", alignItems: "center", gap: "10px",
                  color: "#00FF66", fontSize: "14px", fontWeight: 500,
                }}>
                  <span>✓</span>
                  <span>Transfer queued successfully</span>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <label className="dashboard-label" style={{ display: "block", marginBottom: "8px" }}>Amount (USD)</label>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                        color: "rgba(246,246,246,0.4)", fontSize: "14px", pointerEvents: "none",
                      }}>$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="dashboard-input"
                        style={{ paddingLeft: "30px", margin: 0, width: "100%", boxSizing: "border-box" }}
                        autoFocus
                      />
                    </div>
                    <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "rgba(246,246,246,0.3)" }}>
                      Master wallet balance: ${MOCK_DEV_WALLET.balance_usd.toFixed(2)} USD
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={closeTopUp}
                      className="dashboard-button-secondary"
                      style={{ flex: 1, padding: "11px", fontSize: "13px" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTransfer}
                      className="dashboard-button"
                      style={{ flex: 2, padding: "11px", fontSize: "13px" }}
                      disabled={!topUpAmount || Number(topUpAmount) <= 0}
                    >
                      Transfer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
