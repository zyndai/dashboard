"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AddMoneyModalProps {
  open: boolean;
  destinationAddress: string | null;
  destinationLabel: string;
  defaultNetwork?: "base" | "ethereum";
  defaultFiatCurrency?: "INR" | "USD" | "EUR" | "GBP";
  presetAmounts?: number[];
  onClose: () => void;
  onSuccess?: (txHash: string | null) => void;
}

type Phase = "idle" | "creating" | "awaiting" | "polling" | "success" | "failed";

interface SessionResponse {
  partnerUserRef: string;
  onrampUrl: string;
  sessionId: string;
  expiresAt: string;
}

interface StatusResponse {
  partnerUserRef: string;
  status: "CREATED" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
  txHash: string | null;
  errorMessage: string | null;
}

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

export function AddMoneyModal({
  open,
  destinationAddress,
  destinationLabel,
  defaultNetwork = "base",
  defaultFiatCurrency = "INR",
  presetAmounts = [500, 1000, 2500, 5000],
  onClose,
  onSuccess,
}: AddMoneyModalProps) {
  const [amount, setAmount] = useState<string>(String(presetAmounts[0] ?? ""));
  const [fiatCurrency, setFiatCurrency] = useState(defaultFiatCurrency);
  const [network, setNetwork] = useState(defaultNetwork);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);
  const pollAbort = useRef<{ cancelled: boolean } | null>(null);

  // Reset form state when the modal closes (adjusting state during render, not in an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setPhase("idle");
      setError(null);
      setTxHash(null);
      setAmount(String(presetAmounts[0] ?? ""));
    }
  }

  useEffect(() => {
    if (open) return;
    if (pollAbort.current) pollAbort.current.cancelled = true;
    pollAbort.current = null;
  }, [open]);

  useEffect(() => {
    return () => {
      if (pollAbort.current) pollAbort.current.cancelled = true;
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    };
  }, []);

  const startPolling = useCallback(
    async (partnerUserRef: string) => {
      const token = { cancelled: false };
      pollAbort.current = token;
      setPhase("polling");
      const started = Date.now();

      while (!token.cancelled) {
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          setPhase("failed");
          setError("Timed out waiting for payment confirmation. Check your email for status.");
          return;
        }
        try {
          const res = await fetch(`/api/onramp/status/${partnerUserRef}`);
          if (res.ok) {
            const data = (await res.json()) as StatusResponse;
            if (data.status === "SUCCESS") {
              setTxHash(data.txHash);
              setPhase("success");
              onSuccess?.(data.txHash);
              return;
            }
            if (data.status === "FAILED") {
              setError(data.errorMessage || "Payment failed");
              setPhase("failed");
              return;
            }
          }
        } catch {
          // transient, keep polling
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    },
    [onSuccess]
  );

  async function handleStart() {
    if (!destinationAddress) {
      setError("Destination wallet not ready yet");
      setPhase("failed");
      return;
    }
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setError(null);
    setPhase("creating");

    try {
      const res = await fetch("/api/onramp/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationAddress,
          network,
          fiatCurrency,
          fiatAmount: numeric,
        }),
      });
      const data = (await res.json()) as SessionResponse | { error: string };
      if (!res.ok || !("onrampUrl" in data)) {
        const msg = "error" in data ? data.error : "Failed to create onramp session";
        setError(msg);
        setPhase("failed");
        return;
      }

      setPhase("awaiting");
      popupRef.current = window.open(
        data.onrampUrl,
        "coinbase-onramp",
        "width=480,height=720,noopener=no,popup=yes"
      );
      if (!popupRef.current) {
        // Popup blocked — fall back to same-tab redirect.
        window.location.href = data.onrampUrl;
        return;
      }
      startPolling(data.partnerUserRef);
    } catch (err) {
      console.error("[AddMoneyModal] start failed:", err);
      setError("Network error — please try again");
      setPhase("failed");
    }
  }

  if (!open) return null;

  const busy = phase === "creating" || phase === "awaiting" || phase === "polling";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={busy ? undefined : onClose}
    >
      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          borderRadius: "12px",
          padding: "28px",
          width: "100%",
          maxWidth: "440px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 600 }}>Add Money</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "rgba(246,246,246,0.5)" }}>
            Buy USDC with fiat and send directly to{" "}
            <strong style={{ color: "#fff" }}>{destinationLabel}</strong>
          </p>
          {destinationAddress && (
            <p style={{ margin: "6px 0 0 0", fontSize: "11px", fontFamily: "monospace", color: "rgba(139,92,246,0.7)" }}>
              {destinationAddress}
            </p>
          )}
        </div>

        {phase === "success" ? (
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "rgba(0,255,102,0.08)",
              border: "1px solid rgba(0,255,102,0.2)",
              color: "#00FF66",
              fontSize: "14px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>✓ USDC delivered</div>
            {txHash && (
              <a
                href={`https://${network === "base" ? "basescan.org" : "etherscan.io"}/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#00FF66", fontSize: "12px", fontFamily: "monospace", wordBreak: "break-all" }}
              >
                {txHash.slice(0, 18)}…{txHash.slice(-8)} ↗
              </a>
            )}
            <button
              onClick={onClose}
              className="dashboard-button-secondary"
              style={{ marginTop: "14px", width: "100%", padding: "10px", fontSize: "13px" }}
            >
              Done
            </button>
          </div>
        ) : phase === "failed" ? (
          <div>
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "14px",
              }}
            >
              {error}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onClose} className="dashboard-button-secondary" style={{ flex: 1, padding: "11px", fontSize: "13px" }}>
                Close
              </button>
              <button onClick={() => setPhase("idle")} className="dashboard-button" style={{ flex: 1, padding: "11px", fontSize: "13px" }}>
                Try again
              </button>
            </div>
          </div>
        ) : busy ? (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "2px solid rgba(139,92,246,0.2)",
                borderTop: "2px solid #8B5CF6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 14px",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: "13px", color: "rgba(246,246,246,0.7)" }}>
              {phase === "creating" && "Creating secure session…"}
              {phase === "awaiting" && "Complete payment in the Coinbase popup. Keep this tab open."}
              {phase === "polling" && "Waiting for on-chain settlement (~30s)…"}
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "14px" }}>
              <label className="dashboard-label" style={{ display: "block", marginBottom: "8px" }}>Amount</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <select
                  value={fiatCurrency}
                  onChange={(e) => setFiatCurrency(e.target.value as typeof fiatCurrency)}
                  className="dashboard-input"
                  style={{ flex: "0 0 90px", margin: 0, cursor: "pointer" }}
                >
                  <option value="INR">INR ₹</option>
                  <option value="USD">USD $</option>
                  <option value="EUR">EUR €</option>
                  <option value="GBP">GBP £</option>
                </select>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="dashboard-input"
                  style={{ flex: 1, margin: 0 }}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {presetAmounts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(String(p))}
                    className="dashboard-button-secondary"
                    style={{ padding: "5px 11px", fontSize: "12px" }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label className="dashboard-label" style={{ display: "block", marginBottom: "8px" }}>Receive on</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as typeof network)}
                className="dashboard-input"
                style={{ margin: 0, cursor: "pointer", width: "100%" }}
              >
                <option value="base">USDC on Base (recommended)</option>
                <option value="ethereum">USDC on Ethereum</option>
              </select>
            </div>

            {fiatCurrency === "INR" && (
              <p style={{ margin: "0 0 14px 0", fontSize: "11px", color: "rgba(246,246,246,0.4)" }}>
                India: UPI, IMPS, and Indian debit/credit cards supported. KYC handled by Coinbase.
              </p>
            )}

            {error && (
              <div style={{ marginBottom: "14px", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: "12px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onClose} className="dashboard-button-secondary" style={{ flex: 1, padding: "11px", fontSize: "13px" }}>
                Cancel
              </button>
              <button
                onClick={handleStart}
                className="dashboard-button"
                style={{ flex: 2, padding: "11px", fontSize: "13px" }}
                disabled={!destinationAddress || !amount}
              >
                Continue to Coinbase
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
