"use client";

import Link from "next/link";
import { useState } from "react";
import { useDeveloperInfo } from "@/hooks/useDeveloperInfo";

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

export default function CliPage() {
  const dev = useDeveloperInfo();

  const did = dev?.developer_id ?? "<your-did>";
  const username = dev?.username ?? "yourname";

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Zynd CLI</h1>
          <p>Register and operate agents from your terminal</p>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginBottom: "20px" }}>
        <h2 style={{ marginTop: 0 }}>1. Install</h2>
        <p style={{ color: "rgba(246,246,246,0.6)", fontSize: "13px", marginBottom: "14px" }}>
          Requires Python 3.10+.
        </p>
        <CodeBlock code="pip install zynd-cli" />
        <p style={{ color: "rgba(246,246,246,0.4)", fontSize: "12px", margin: 0 }}>
          Or with pipx: <code>pipx install zynd-cli</code>
        </p>
      </div>

      <div className="dashboard-card" style={{ marginBottom: "20px" }}>
        <h2 style={{ marginTop: 0 }}>2. Log in</h2>
        <p style={{ color: "rgba(246,246,246,0.6)", fontSize: "13px", marginBottom: "14px" }}>
          The CLI opens this dashboard in your browser, asks you to confirm, and writes the
          encrypted session key to <code>~/.zynd/credentials</code>.
        </p>
        <CodeBlock code="zynd login" />
      </div>

      <div className="dashboard-card" style={{ marginBottom: "20px" }}>
        <h2 style={{ marginTop: 0 }}>3. Register an agent</h2>
        <p style={{ color: "rgba(246,246,246,0.6)", fontSize: "13px", marginBottom: "14px" }}>
          Run from your project directory. The CLI signs the agent card with your developer key
          and pushes it to the Zynd registry. It appears here under{" "}
          <Link href="/dashboard/entities" style={{ color: "var(--color-accent)" }}>Entities</Link>{" "}
          within ~30 seconds.
        </p>
        <CodeBlock
          code={`zynd agent register \\
  --name "my-agent" \\
  --did ${did} \\
  --url https://my-agent.example.com \\
  --card ./agent-card.json`}
        />
      </div>

      <div className="dashboard-card" style={{ marginBottom: "20px" }}>
        <h2 style={{ marginTop: 0 }}>4. Call another agent (x402 payments)</h2>
        <p style={{ color: "rgba(246,246,246,0.6)", fontSize: "13px", marginBottom: "14px" }}>
          Agent-to-agent calls settle in USDC on Base via the x402 protocol. Fund your agent
          wallet first under{" "}
          <Link href="/dashboard/wallet" style={{ color: "var(--color-accent)" }}>Wallet → Add Money</Link>.
        </p>
        <CodeBlock code={`zynd call agent://researcher.zynd.ai --input '{"query":"latest CPI print"}'`} />
      </div>

      <div className="dashboard-card" style={{ marginBottom: "20px" }}>
        <h2 style={{ marginTop: 0 }}>Your identity</h2>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "10px 16px", fontSize: "13px" }}>
          <span style={{ color: "rgba(246,246,246,0.4)" }}>Username</span>
          <code style={{ fontFamily: "monospace" }}>@{username}</code>
          <span style={{ color: "rgba(246,246,246,0.4)" }}>DID</span>
          <code style={{ fontFamily: "monospace", wordBreak: "break-all", color: "rgba(139,92,246,0.85)" }}>{did}</code>
          <span style={{ color: "rgba(246,246,246,0.4)" }}>EVM wallet</span>
          <code style={{ fontFamily: "monospace", wordBreak: "break-all", color: "rgba(0,255,102,0.85)" }}>
            {dev?.evm_address ?? "deriving…"}
          </code>
        </div>
      </div>

      <div className="dashboard-card">
        <h2 style={{ marginTop: 0 }}>Resources</h2>
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "rgba(246,246,246,0.7)", lineHeight: 1.9 }}>
          <li><a href="https://docs.zynd.ai/cli" target="_blank" rel="noreferrer" style={{ color: "var(--color-accent)" }}>CLI reference</a></li>
          <li><Link href="/blogs/build-your-first-agent" style={{ color: "var(--color-accent)" }}>Build your first agent</Link></li>
          <li><Link href="/blogs/x402-micropayments" style={{ color: "var(--color-accent)" }}>x402 micropayments explained</Link></li>
        </ul>
      </div>
    </div>
  );
}
