"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ZYND memory-layer API. Override per-env with NEXT_PUBLIC_ZYND_API_URL.
const API_BASE = process.env.NEXT_PUBLIC_ZYND_API_URL || "https://api.zynd.ai";

type ExchangeResult = { token: string; mcp_url: string; email: string };
type Status = "loading" | "ready" | "error";

// MCP clients that consume the standard `mcpServers` block (variant=false) vs ones
// that need a different schema/flow (variant=true → we point them at their own setup).
const CLIENTS: { name: string; initial: string; color: string; loc: string; variant: boolean }[] = [
  { name: "Claude Desktop", initial: "C", color: "#D97757", loc: "Settings → Developer → Edit Config", variant: false },
  { name: "Claude Code", initial: "C", color: "#D97757", loc: "Add to .mcp.json, or run claude mcp add", variant: false },
  { name: "Cursor", initial: "Cu", color: "#6E56CF", loc: "Settings → MCP → Add new server", variant: false },
  { name: "Windsurf", initial: "W", color: "#22C55E", loc: "~/.codeium/windsurf/mcp_config.json", variant: false },
  { name: "Cline", initial: "Cl", color: "#3B82F6", loc: "MCP Servers → Configure → cline_mcp_settings.json", variant: false },
  { name: "Continue", initial: "Co", color: "#8B5CF6", loc: "config.json → mcpServers", variant: false },
  { name: "VS Code (Copilot)", initial: "V", color: "#3B82F6", loc: ".vscode/mcp.json — uses a \"servers\" key", variant: true },
  { name: "Zed", initial: "Z", color: "#9CA3AF", loc: "settings.json → context_servers", variant: true },
  { name: "ChatGPT", initial: "G", color: "#10A37F", loc: "Already supported via the ZYND GPT", variant: true },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "relative" }}>
      <pre
        style={{
          margin: 0,
          padding: "16px 56px 16px 18px",
          background: "#07070d",
          border: "1px solid rgba(139,92,246,0.28)",
          borderRadius: "10px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "12.5px",
          color: "#e9e6ff",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          lineHeight: 1.6,
        }}
      >
        {code}
      </pre>
      <button
        onClick={onCopy}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: copied ? "rgba(34,197,94,0.18)" : "linear-gradient(135deg,#8B5CF6,#3B82F6)",
          color: copied ? "#4ade80" : "#fff",
          border: copied ? "1px solid rgba(34,197,94,0.4)" : "none",
          borderRadius: "7px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {copied ? "✓ Copied" : "Copy"}
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
      <style>{CONNECT_CSS}</style>

      <div className="dashboard-header">
        <div>
          <h1>Connect any AI</h1>
          <p>Give ChatGPT, Claude, Cursor, or any MCP client access to your ZYND memory</p>
        </div>
      </div>

      {status === "loading" && (
        <div className="zc-card zc-loader">
          <div className="zc-spinner" />
          <div>
            <div className="zc-loader-title">Creating your secure connection…</div>
            <div className="zc-loader-sub">Verifying your identity and minting your private token. One moment.</div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="zc-card">
          <p style={{ color: "#ff9b9b", fontSize: "14px", marginTop: 0, fontWeight: 500 }}>{error}</p>
          <button className="zc-btn" onClick={() => setReloadKey((k) => k + 1)}>
            Retry
          </button>
        </div>
      )}

      {status === "ready" && result && (
        <>
          <div className="zc-card zc-card-hero" style={{ marginBottom: "18px" }}>
            <div className="zc-connected">
              <span className="zc-dot" /> Connected as <strong>{result.email}</strong>
            </div>
            <h2 className="zc-h2">1 · Copy your connection config</h2>
            <p className="zc-sub">
              This block holds your private token — treat it like a password. It works in any MCP client below.
            </p>
            <CodeBlock code={config} />
          </div>

          <div className="zc-card" style={{ marginBottom: "18px" }}>
            <h2 className="zc-h2">2 · Add it to your AI client</h2>
            <p className="zc-sub">
              Most clients use the same <code className="zc-code">mcpServers</code> block — paste it, then restart
              the app. A few use their own format (marked “See docs”).
            </p>
            <div className="zc-grid">
              {CLIENTS.map((c) => (
                <div key={c.name} className="zc-client">
                  <div className="zc-client-head">
                    <span className="zc-logo" style={{ background: c.color }}>{c.initial}</span>
                    <span className="zc-client-name">{c.name}</span>
                  </div>
                  <div className="zc-client-loc">{c.loc}</div>
                  <span className={`zc-tag ${c.variant ? "zc-tag-alt" : "zc-tag-ok"}`}>
                    {c.variant ? "See docs" : "Paste block"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="zc-card">
            <h2 className="zc-h2">What your AI can now do</h2>
            <ul className="zc-list">
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

const CONNECT_CSS = `
.zc-card{background:rgba(255,255,255,.045);border:1px solid rgba(139,92,246,.16);
  border-radius:16px;padding:24px 24px}
.zc-card-hero{border-color:rgba(139,92,246,.38);
  box-shadow:0 0 0 1px rgba(139,92,246,.08),0 18px 60px rgba(139,92,246,.10)}
.zc-h2{margin:0 0 6px;font-size:16px;font-weight:600;color:#f6f6f6;letter-spacing:-.01em}
.zc-sub{margin:0 0 16px;color:rgba(246,246,246,.74);font-size:13.5px;line-height:1.6}
.zc-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#c9bdff;font-size:12.5px;
  background:rgba(139,92,246,.12);padding:1px 6px;border-radius:5px}
.zc-connected{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:rgba(246,246,246,.82);
  background:rgba(34,197,94,.10);border:1px solid rgba(34,197,94,.28);padding:6px 12px;
  border-radius:999px;margin-bottom:16px}
.zc-connected strong{color:#fff;font-weight:600}
.zc-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e}
.zc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.zc-client{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.10);
  border-radius:12px;padding:14px 15px;transition:border-color .15s,background .15s}
.zc-client:hover{border-color:rgba(139,92,246,.4);background:rgba(139,92,246,.06)}
.zc-client-head{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.zc-logo{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;color:#fff;flex-shrink:0}
.zc-client-name{font-size:14px;font-weight:600;color:#f6f6f6}
.zc-client-loc{font-size:11.5px;color:rgba(246,246,246,.6);line-height:1.5;margin-bottom:10px;min-height:34px}
.zc-tag{font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:999px;letter-spacing:.01em}
.zc-tag-ok{color:#a78bfa;background:rgba(139,92,246,.14);border:1px solid rgba(139,92,246,.3)}
.zc-tag-alt{color:#d8c089;background:rgba(217,180,80,.10);border:1px solid rgba(217,180,80,.28)}
.zc-list{margin:0;padding-left:0;list-style:none}
.zc-list li{position:relative;padding-left:26px;font-size:13.5px;color:rgba(246,246,246,.82);
  line-height:1.5;margin-bottom:11px}
.zc-list li:last-child{margin-bottom:0}
.zc-list li::before{content:"✓";position:absolute;left:0;top:0;width:18px;height:18px;
  display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#a78bfa;
  background:rgba(139,92,246,.16);border-radius:5px}
.zc-btn{background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;border:0;border-radius:9px;
  padding:10px 18px;font-size:13.5px;font-weight:600;cursor:pointer}
.zc-loader{display:flex;align-items:center;gap:18px}
.zc-loader-title{font-size:15px;font-weight:600;color:#f6f6f6;margin-bottom:4px}
.zc-loader-sub{font-size:13px;color:rgba(246,246,246,.66);line-height:1.5}
.zc-spinner{width:34px;height:34px;border-radius:50%;flex-shrink:0;
  border:3px solid rgba(139,92,246,.22);border-top-color:#8B5CF6;animation:zc-spin .8s linear infinite}
@keyframes zc-spin{to{transform:rotate(360deg)}}
`;
