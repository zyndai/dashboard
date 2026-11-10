"use client";

import Link from "next/link";
import { useN8nData } from "@/lib/n8n/client";
import { formatBalance, keyState } from "@/lib/n8n/format";
import type { N8nApiKey, N8nListing, N8nTask, N8nWallet } from "@/lib/n8n/types";
import { ListingAnalytics } from "./analytics";
import { TaskTable } from "./task-table";
import { CopyField, ErrorBox, Loading } from "./ui";

/** M4.5: active listings, key count, recent tasks, plus the outbound payer wallet (M4.10). */
export function N8nOverview() {
  const listings = useN8nData<{ listings: N8nListing[] }>("/listings", { pollMs: 15_000 });
  const keys = useN8nData<{ keys: N8nApiKey[] }>("/api-keys");
  const tasks = useN8nData<{ tasks: N8nTask[] }>("/tasks?limit=5", { pollMs: 30_000 });
  const wallet = useN8nData<N8nWallet>("/wallet");

  if (listings.loading || keys.loading) return <Loading what="your n8n panel" />;

  const all = listings.data?.listings ?? [];
  const live = all.filter((l) => l.status === "ACTIVE" && l.heartbeat?.status === "ACTIVE").length;
  const activeKeys = (keys.data?.keys ?? []).filter((k) => keyState(k) === "active").length;
  const names = Object.fromEntries(all.map((l) => [l.id, l.name]));
  const firstError = listings.error ?? keys.error;

  const stat = (value: string | number, label: string, href: string) => (
    <Link href={href} className="stats-card" style={{ textDecoration: "none" }}>
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
    </Link>
  );

  return (
    <>
      {firstError && <ErrorBox message={firstError} />}
      <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
        {stat(live, `Live listing${live === 1 ? "" : "s"} (of ${all.length})`, "/dashboard/n8n/listings")}
        {stat(activeKeys, `Active API key${activeKeys === 1 ? "" : "s"}`, "/dashboard/n8n/api-keys")}
      </div>

      {all.length === 0 && (
        <div className="dashboard-card">
          <h2 style={{ marginTop: 0, fontSize: "18px" }}>Get started</h2>
          <ol style={{ lineHeight: 1.9, fontSize: "14px", color: "rgba(246,246,246,0.75)", paddingLeft: 20, margin: 0 }}>
            <li><Link href="/dashboard/n8n/listings/new" style={{ color: "var(--color-accent)" }}>Create a listing</Link> for your agent.</li>
            <li><Link href="/dashboard/n8n/api-keys/new" style={{ color: "var(--color-accent)" }}>Create an API key</Link> and paste it into the Zynd API credential in n8n.</li>
            <li>In n8n, start a workflow with the <strong>Zynd Trigger</strong>, pick your listing and activate the workflow. The listing goes live.</li>
          </ol>
        </div>
      )}

      {all.length > 0 && <ListingAnalytics names={names} />}

      <h3>Recent tasks</h3>
      <div className="dashboard-card" style={{ padding: 0 }}>
        {tasks.loading ? <Loading what="tasks" /> : tasks.error ? <div style={{ padding: 20 }}><ErrorBox message={tasks.error} /></div> : <TaskTable tasks={tasks.data?.tasks ?? []} showListing={names} />}
      </div>

      {wallet.data && (
        <>
          <h3>Payer wallet</h3>
          <div className="dashboard-card">
            <p style={{ margin: "0 0 12px", fontSize: "14px", color: "rgba(246,246,246,0.6)" }}>
              Calls you make to paid agents are paid from this address. Send funds to it on the network your Gateway uses.
            </p>
            <CopyField value={wallet.data.payer} />
            <p style={{ margin: "12px 0 0", fontSize: "14px", color: "rgba(246,246,246,0.6)" }}>Balance: <strong style={{ color: "#fff" }}>{formatBalance(wallet.data.payerBalanceUsd)}</strong></p>
          </div>
        </>
      )}
    </>
  );
}
