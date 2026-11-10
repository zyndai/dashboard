"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { n8nFetch, useN8nData } from "@/lib/n8n/client";
import { formatUsd, listingBadge } from "@/lib/n8n/format";
import type { N8nListing, N8nTask, N8nWallet } from "@/lib/n8n/types";
import { ListingForm } from "./listing-form";
import { ToggleButton } from "./listings";
import { TaskTable } from "./task-table";
import { CopyField, ErrorBox, Loading, StatusBadge } from "./ui";

const row = (label: string, value: React.ReactNode) => (
  <div style={{ display: "flex", gap: "16px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <div style={{ width: "150px", flexShrink: 0, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(246,246,246,0.45)" }}>{label}</div>
    <div style={{ minWidth: 0, flex: 1, fontSize: "14px", wordBreak: "break-all" }}>{value}</div>
  </div>
);

/** One listing: status, endpoints, receiving wallet (M4.10), settings, and its task history (M4.9). */
export function ListingDetail({ id }: { id: string }) {
  const router = useRouter();
  const failed = useSearchParams().get("activationFailed");
  const path = `/listings/${encodeURIComponent(id)}`;
  const listing = useN8nData<N8nListing>(path, { pollMs: 15_000 });
  const tasks = useN8nData<{ tasks: N8nTask[] }>(`/tasks?listingId=${encodeURIComponent(id)}&limit=25`, { pollMs: 30_000 });
  const wallet = useN8nData<N8nWallet>("/wallet");
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(failed);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (listing.loading) return <Loading what="listing" />;
  if (listing.error || !listing.data) {
    return (
      <>
        <ErrorBox message={listing.error ?? "Listing not found"} />
        <Link href="/dashboard/n8n/listings" style={{ color: "var(--color-accent)" }}>Back to listings</Link>
      </>
    );
  }
  const l = listing.data;
  const badge = listingBadge(l);
  const address = wallet.data?.listings.find((w) => w.listingId === l.id)?.address;

  async function remove() {
    setDeleting(true);
    try {
      await n8nFetch(path, { method: "DELETE" });
      router.push("/dashboard/n8n/listings");
      router.refresh();
    } catch (e) {
      setActionError((e as Error).message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (editing) {
    return (
      <>
        <h2 style={{ marginTop: 0 }}>Edit {l.name}</h2>
        <ListingForm
          listingId={l.id}
          initial={{ name: l.name, summary: l.summary, category: l.category, tags: l.tags.join(", "), workflowId: l.workflowId ?? "", priceUsd: l.priceUsd ?? "" }}
        />
        <button className="dashboard-button-secondary" style={{ marginTop: "16px" }} onClick={() => setEditing(false)}>Cancel</button>
      </>
    );
  }

  return (
    <>
      {actionError && <ErrorBox message={actionError} />}
      <div className="dashboard-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "12px" }}>
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: "20px" }}>{l.name}</h2>
            <StatusBadge badge={badge} />
            {badge.hint && <p style={{ margin: "10px 0 0", fontSize: "13px", color: "rgba(246,246,246,0.55)" }}>{badge.hint}</p>}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <ToggleButton listing={l} onDone={() => { setActionError(null); void listing.reload(); }} onError={setActionError} />
            <button className="dashboard-button-secondary" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "4px" }} onClick={() => setEditing(true)}>Edit</button>
          </div>
        </div>

        {row("Summary", l.summary)}
        {row("Category", l.category)}
        {row("Tags", l.tags.length ? l.tags.join(", ") : "—")}
        {row("Price per call", l.priceUsd === null ? "Platform default" : Number(l.priceUsd) === 0 ? "Free" : formatUsd(l.priceUsd))}
        {row("n8n workflow", l.workflowId ?? "—")}
        {row("Entity ID", l.entityId ? <CopyField value={l.entityId} /> : "Not registered yet")}
        {row("Agent URL", l.entityUrl ? <CopyField value={l.entityUrl} /> : "—")}
        {row("n8n webhook", l.webhookUrl ?? "Bound when you activate a workflow with the Zynd Trigger")}
        {row("Last heartbeat", l.heartbeat?.lastBeatAt ? new Date(l.heartbeat.lastBeatAt).toLocaleString() : "—")}
        {row("Payout wallet", address ? <><CopyField value={address} /><p style={{ margin: "6px 0 0", fontSize: "12px", color: "rgba(246,246,246,0.4)" }}>Callers pay this address. It is derived from your key; the Gateway holds the signing key.</p></> : wallet.error ? "Unavailable" : "…")}
      </div>

      <h3>Task history</h3>
      <div className="dashboard-card" style={{ padding: 0 }}>
        {tasks.loading ? <Loading what="tasks" /> : tasks.error ? <div style={{ padding: 20 }}><ErrorBox message={tasks.error} /></div> : <TaskTable tasks={tasks.data?.tasks ?? []} />}
      </div>

      <h3>Delete listing</h3>
      <div className="dashboard-card">
        <p style={{ margin: "0 0 16px", fontSize: "14px", color: "rgba(246,246,246,0.6)" }}>
          Stops the heartbeat and removes the listing. The agent drops off the network within minutes. Past tasks stay in your history.
        </p>
        {confirmDelete ? (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button className="dashboard-button" style={{ background: "#ef4444" }} disabled={deleting} onClick={remove}>{deleting ? "Deleting…" : "Yes, delete it"}</button>
            <button className="dashboard-button-secondary" disabled={deleting} onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        ) : (
          <button className="dashboard-button-secondary" style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.4)", alignSelf: "flex-start" }} onClick={() => setConfirmDelete(true)}>Delete listing…</button>
        )}
      </div>
    </>
  );
}
