"use client";

import { useMemo, useState } from "react";
import { useN8nData } from "@/lib/n8n/client";
import { dailyBars, formatRate, formatUsd } from "@/lib/n8n/format";
import type { N8nAnalytics, N8nListing } from "@/lib/n8n/types";
import { Empty, ErrorBox, Loading } from "./ui";

const RANGES = [7, 30, 90] as const;
const CHART_H = 120;

/**
 * M6.2: calls per day (green = completed, red = failed, grey = cancelled or open) and a per-listing
 * table of calls, error rate and revenue. Inbound calls only. Pass `listingId` for one listing, or
 * `names` (id -> name) to label the rows of the all-listings view.
 */
export function ListingAnalytics({ listingId, names }: { listingId?: string; names?: Record<string, string> }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const qs = `?days=${days}${listingId ? `&listingId=${encodeURIComponent(listingId)}` : ""}`;
  const { data, error, loading } = useN8nData<N8nAnalytics>(`/analytics${qs}`, { pollMs: 60_000 });

  const bars = useMemo(() => (data ? dailyBars(data.series, data.days, new Date().toISOString().slice(0, 10)) : []), [data]);
  const peak = Math.max(1, ...bars.map((b) => b.calls));
  const total = data?.totals.reduce((a, t) => ({ calls: a.calls + t.calls, revenue: a.revenue + Number(t.revenueUsd) }), { calls: 0, revenue: 0 });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: "24px 0 12px" }}>Analytics</h3>
        <div role="group" aria-label="Time range" style={{ display: "flex", gap: 4 }}>
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={days === r} className={days === r ? "dashboard-button" : "dashboard-button-secondary"} style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => setDays(r)}>
              {r} days
            </button>
          ))}
        </div>
      </div>
      <div className="dashboard-card">
        {loading && !data ? <Loading what="analytics" /> : error && !data ? <ErrorBox message={error} /> : !data || total?.calls === 0 ? (
          <Empty title="No calls in this period">Calls other agents make to your listings show up here.</Empty>
        ) : (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(246,246,246,0.6)" }}>
              {total?.calls} call{total?.calls === 1 ? "" : "s"} · {formatUsd(String(total?.revenue ?? 0))} earned in the last {data.days} days (UTC days)
            </p>
            <div role="img" aria-label={`Calls per day over the last ${data.days} days`} style={{ display: "flex", alignItems: "flex-end", gap: days > 30 ? 1 : 3, height: CHART_H }}>
              {bars.map((b) => (
                <div
                  key={b.day} style={{ flex: 1, display: "flex", flexDirection: "column-reverse", height: "100%", justifyContent: "flex-start" }}
                  title={`${b.day}: ${b.calls} call${b.calls === 1 ? "" : "s"}, ${b.failed} failed, ${formatUsd(String(b.revenueUsd))}`}
                >
                  <div style={{ height: (b.completed / peak) * CHART_H, background: "#22c55e" }} />
                  <div style={{ height: (b.other / peak) * CHART_H, background: "rgba(246,246,246,0.3)" }} />
                  <div style={{ height: (b.failed / peak) * CHART_H, background: "#ef4444" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(246,246,246,0.4)", marginTop: 4 }}>
              <span>{bars[0]?.day}</span>
              <span>{bars[bars.length - 1]?.day}</span>
            </div>
            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table className="dashboard-table">
                <thead><tr><th>Listing</th><th>Calls</th><th>Error rate</th><th>Revenue</th></tr></thead>
                <tbody>
                  {data.totals.map((t) => (
                    <tr key={t.listingId ?? "deleted"}>
                      <td>{t.listingId ? (names?.[t.listingId] ?? (listingId ? "This listing" : t.listingId.slice(0, 8))) : "Deleted listing"}</td>
                      <td>{t.calls}</td>
                      <td title={`${t.failed} failed of ${t.completed + t.failed} finished`}>{formatRate(t.errorRate)}</td>
                      <td>{formatUsd(t.revenueUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/** Helper for callers that hold a listings list. */
export const listingNames = (listings: Pick<N8nListing, "id" | "name">[]): Record<string, string> => Object.fromEntries(listings.map((l) => [l.id, l.name]));
