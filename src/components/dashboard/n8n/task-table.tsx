"use client";

import { formatUsd, shortId, taskTone, toneClass } from "@/lib/n8n/format";
import type { N8nTask } from "@/lib/n8n/types";
import { Empty, Mono } from "./ui";

const when = (iso: string) => new Date(iso).toLocaleString();

/** M4.9: inbound and outbound tasks with status, timestamps and payment amount. */
export function TaskTable({ tasks, showListing }: { tasks: N8nTask[]; showListing?: Record<string, string> }) {
  if (tasks.length === 0) return <Empty title="No tasks yet">Calls to your agents and calls you make with the Zynd node show up here.</Empty>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Direction</th>
            {showListing && <th>Listing</th>}
            <th>Counterparty</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Payment</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td title={`Updated ${when(t.updatedAt)}`}>{when(t.createdAt)}</td>
              <td>{t.direction === "INBOUND" ? "Inbound" : "Outbound"}</td>
              {showListing && <td>{(t.listingId && showListing[t.listingId]) || "—"}</td>}
              <td>{t.callerId ? <Mono title={t.callerId}>{shortId(t.callerId)}</Mono> : "—"}</td>
              <td>
                <span className={`dashboard-badge ${toneClass(taskTone(t.status))}`} title={t.error ?? undefined}>{t.status}</span>
                {t.error && <div style={{ marginTop: "4px", fontSize: "12px", color: "rgba(246,246,246,0.4)", maxWidth: "240px" }}>{t.error}</div>}
              </td>
              <td style={{ textAlign: "right" }} title={t.paymentTxn ?? undefined}>{formatUsd(t.paymentUsd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
