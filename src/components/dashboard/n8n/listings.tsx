"use client";

import { useState } from "react";
import Link from "next/link";
import { n8nFetch, useN8nData } from "@/lib/n8n/client";
import { listingBadge, nextToggle } from "@/lib/n8n/format";
import type { N8nListing } from "@/lib/n8n/types";
import { Empty, ErrorBox, Loading, Mono, StatusBadge } from "./ui";

/** Activate / deactivate with its own busy state. Used by the table and the detail page. */
export function ToggleButton({ listing, onDone, onError }: { listing: N8nListing; onDone: () => void; onError: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const action = nextToggle(listing.status);
  if (!action) return null;
  return (
    <button
      className="dashboard-button-secondary" disabled={busy}
      style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "4px" }}
      onClick={async () => {
        setBusy(true);
        try {
          await n8nFetch(`/listings/${encodeURIComponent(listing.id)}/${action}`, { method: "POST" });
          onDone();
        } catch (e) {
          onError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "…" : action === "activate" ? "Activate" : "Deactivate"}
    </button>
  );
}

/** M4.6: polls so a status badge follows the heartbeat. */
export function ListingsTable() {
  const { data, error, loading, reload } = useN8nData<{ listings: N8nListing[] }>("/listings", { pollMs: 15_000 });
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) return <Loading what="listings" />;
  const listings = data?.listings ?? [];

  return (
    <>
      {(error || actionError) && <ErrorBox message={(actionError ?? error) as string} />}
      <div className="dashboard-card" style={{ padding: 0 }}>
        {listings.length === 0 ? (
          <Empty title="No listings yet">
            A listing is an agent other people can find and pay. <Link href="/dashboard/n8n/listings/new" style={{ color: "var(--color-accent)" }}>Create your first listing</Link>.
          </Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dashboard-table">
              <thead>
                <tr><th>Listing</th><th>Status</th><th>Price</th><th>Entity ID</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const badge = listingBadge(l);
                  return (
                    <tr key={l.id}>
                      <td>
                        <Link href={`/dashboard/n8n/listings/${encodeURIComponent(l.id)}`} style={{ fontWeight: 500, color: "#fff", textDecoration: "none" }}>{l.name}</Link>
                        <div style={{ marginTop: "4px", fontSize: "12px", color: "rgba(246,246,246,0.35)", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.summary}</div>
                      </td>
                      <td><StatusBadge badge={badge} /></td>
                      <td>{l.priceUsd === null ? "Default" : Number(l.priceUsd) === 0 ? "Free" : `$${Number(l.priceUsd)}`}</td>
                      <td>{l.entityId ? <Mono title={l.entityId}>{`${l.entityId.slice(0, 14)}…`}</Mono> : "—"}</td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <ToggleButton listing={l} onDone={() => { setActionError(null); void reload(); }} onError={setActionError} />
                          <Link href={`/dashboard/n8n/listings/${encodeURIComponent(l.id)}`} className="dashboard-button-secondary" style={{ padding: "6px 12px", fontSize: "12px", textDecoration: "none", borderRadius: "4px" }}>View</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
