"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ZYND memory-layer API. Override per-env with NEXT_PUBLIC_ZYND_API_URL.
const API_BASE = process.env.NEXT_PUBLIC_ZYND_API_URL || "https://api.zynd.ai";

type ExchangeResult = { token: string; mcp_url: string; email: string };
type Status = "loading" | "ready" | "error";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "relative", marginBottom: "12px" }}>
      <pre
        style={{
          margin: 0,
          padding: "14px 50px 14px 16px",
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.18)",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12.5px",
          color: "rgba(246,246,246,0.85)",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          lineHeight: 1.55,
        }}
      >
        {code}
      </pre>
      <button
        onClick={onCopy}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: copied ? "rgba(0,255,102,0.12)" : "rgba(0,0,0,0.5)",
          color: copied ? "#00FF66" : "rgba(246,246,246,0.6)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "5px",
          padding: "4px 9px",
          fontSize: "11px",
          cursor: "pointer",
        }}
      >
        {copied ? "✓ copied" : "copy"}
      </button>
    </div>
  );
}

export default function ConnectPage() {
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<Status>("loading");
  const [result, setResult] = useState<ExchangeResult | null>(null);
  const [error, setError] = useState("");
  // Bumped to re-run the exchange effect (retry) without a setState-watching effect.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function exchange() {
      setStatus("loading");
      setError("");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        // Layout gates /dashboard behind auth, so this is defensive, not expected.
        if (!accessToken) throw new Error("No active session. Please sign in again.");

        const res = await fetch(`${API_BASE}/token/exchange`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error(`Token exchange failed (${res.status}). Try again.`);

        const data = (await res.json()) as ExchangeResult;
        if (!cancelled) {
          setResult(data);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          setStatus("error");
        }
      }
    }

    exchange();
    return () => {
      cancelled = true;
    };
  }, [supabase, reloadKey]);

  const config = result
    ? JSON.stringify(
        {
          mcpServers: {
            zynd: {
              command: "npx",
              args: ["-y", "mcp-remote", result.mcp_url, "--header", `Authorization: Bearer ${result.token}`],
            },
          },
        },
        null,
        2,
      )
    : "";

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Connect any AI</h1>
          <p>Give ChatGPT, Claude, Cursor, or any MCP client access to your ZYND memory</p>
        </div>
      </div>

      {status === "loading" && (
        <div className="dashboard-card">
          <p style={{ color: "rgba(246,246,246,0.6)", fontSize: "13px", margin: 0 }}>
            Setting up your connection…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="dashboard-card">
          <p style={{ color: "#ff8585", fontSize: "13px", marginTop: 0 }}>{error}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            style={{
              background: "rgba(139,92,246,0.12)",
              color: "var(--color-accent)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "6px",
              padding: "8px 14px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {status === "ready" && result && (
        <>
          <div className="dashboard-card" style={{ marginBottom: "20px" }}>
            <h2 style={{ marginTop: 0 }}>1. Copy your config</h2>
            <p style={{ color: "rgba(246,246,246,0.6)", fontSize: "13px", marginBottom: "14px" }}>
              Connected as <code style={{ color: "rgba(139,92,246,0.85)" }}>{result.email}</code>. This
              config holds your private token — treat it like a password.
            </p>
            <CodeBlock code={config} />
          </div>

          <div className="dashboard-card" style={{ marginBottom: "20px" }}>
            <h2 style={{ marginTop: 0 }}>2. Paste it into your AI client</h2>
            <p style={{ color: "rgba(246,246,246,0.6)", fontSize: "13px", marginBottom: "10px" }}>
              <b style={{ color: "rgba(246,246,246,0.85)" }}>Claude Desktop</b> — Settings → Developer →
              Edit Config (<code>claude_desktop_config.json</code>), merge the block above, then restart
              Claude.
            </p>
            <p style={{ color: "rgba(246,246,246,0.6)", fontSize: "13px", margin: 0 }}>
              <b style={{ color: "rgba(246,246,246,0.85)" }}>Cursor</b> — Settings → MCP → Add new server,
              paste the same block.
            </p>
          </div>

          <div className="dashboard-card">
            <h2 style={{ marginTop: 0 }}>What your AI can now do</h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "13px",
                color: "rgba(246,246,246,0.7)",
                lineHeight: 1.9,
              }}
            >
              <li>Recall your context — what you’re building, learning, and intending</li>
              <li>Confirm or forget facts to keep your memory accurate</li>
              <li>Find people working on similar things</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
