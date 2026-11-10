import type { N8nApiKey, N8nListing, N8nTask } from "./types";
import { KEY_PERMISSIONS } from "./types";

export type Tone = "active" | "pending" | "warning" | "error" | "muted";

export interface Badge {
  label: string;
  tone: Tone;
  /** One line telling the developer what to do or what is happening. */
  hint?: string;
}

/**
 * M4.6: one badge per listing that folds the listing state and the heartbeat together.
 * ACTIVE listings show their heartbeat (ACTIVE / RECONNECTING / FAILED); a listing that is
 * registered but has no bound workflow is not beating yet, so say so.
 */
export function listingBadge(l: Pick<N8nListing, "status" | "webhookUrl" | "heartbeat">): Badge {
  switch (l.status) {
    case "DRAFT":
      return { label: "DRAFT", tone: "muted", hint: "Not registered yet. Activate it, or activate a workflow that uses it." };
    case "REGISTERING":
      return { label: "REGISTERING", tone: "pending", hint: "Registering with the network." };
    case "INACTIVE":
      return { label: "INACTIVE", tone: "warning", hint: "Switched off. It does not appear online." };
    case "ERROR":
      return { label: "ERROR", tone: "error", hint: "Registration failed. Activate again to retry." };
    case "ACTIVE": {
      if (!l.webhookUrl) return { label: "NO WORKFLOW", tone: "pending", hint: "Registered. Activate an n8n workflow with the Zynd Trigger on this listing to go live." };
      const hb = l.heartbeat?.status;
      if (hb === "ACTIVE") return { label: "ACTIVE", tone: "active", hint: "Online and discoverable." };
      if (hb === "RECONNECTING") return { label: "RECONNECTING", tone: "warning", hint: "Heartbeat is failing; retrying." };
      if (hb === "FAILED") return { label: "FAILED", tone: "error", hint: "Heartbeat stopped after repeated failures. Deactivate and activate to restart." };
      return { label: "CONNECTING", tone: "pending", hint: "Starting the heartbeat." };
    }
  }
}

/** Show the button that makes sense: ACTIVE listings can be switched off, all others switched on. */
export const nextToggle = (status: N8nListing["status"]): "activate" | "deactivate" | null =>
  status === "ACTIVE" ? "deactivate" : status === "REGISTERING" ? null : "activate";

/** M4.8: the stored prefix plus bullets, never more than the prefix. */
export const maskKey = (prefix: string): string => `${prefix}${"•".repeat(12)}`;

export function keyState(k: Pick<N8nApiKey, "revokedAt" | "expiresAt">, now = Date.now()): "revoked" | "expired" | "active" {
  if (k.revokedAt) return "revoked";
  if (k.expiresAt && new Date(k.expiresAt).getTime() <= now) return "expired";
  return "active";
}

export const formatUsd = (v: string | null | undefined): string => {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  // Keep up to 6 decimals but drop trailing zeros beyond 2.
  return `$${n.toFixed(6).replace(/(\.\d{2}\d*?)0+$/, "$1")}`;
};

export const shortId = (id: string | null, head = 10, tail = 6): string =>
  !id ? "—" : id.length <= head + tail + 1 ? id : `${id.slice(0, head)}…${id.slice(-tail)}`;

export const parseTags = (raw: string): string[] =>
  [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];

const USD = /^\d{1,12}(\.\d{1,6})?$/;

export interface ListingFormValues {
  name: string;
  summary: string;
  category: string;
  tags: string;
  workflowId: string;
  /** Blank = the Gateway default price; "0" = free. */
  priceUsd: string;
}

export interface ListingFormResult {
  errors: Partial<Record<keyof ListingFormValues, string>>;
  /** Body for POST /api/n8n/listings; undefined when there are errors. */
  payload?: { name: string; summary: string; category: string; tags: string[]; workflowId?: string; priceUsd?: string };
}

/** M4.7: the same limits the Gateway enforces, so mistakes show up before the request. */
export function validateListingForm(v: ListingFormValues): ListingFormResult {
  const errors: ListingFormResult["errors"] = {};
  const name = v.name.trim();
  const summary = v.summary.trim();
  const category = v.category.trim();
  const tags = parseTags(v.tags);
  const price = v.priceUsd.trim();
  const workflowId = v.workflowId.trim();

  if (!name) errors.name = "Name is required";
  else if (name.length > 100) errors.name = "At most 100 characters";
  if (!summary) errors.summary = "Summary is required";
  else if (summary.length > 300) errors.summary = "At most 300 characters";
  if (!category) errors.category = "Category is required";
  else if (category.length > 50) errors.category = "At most 50 characters";
  if (tags.length > 10) errors.tags = "At most 10 tags";
  else if (tags.some((t) => t.length > 40)) errors.tags = "Each tag is at most 40 characters";
  if (workflowId.length > 100) errors.workflowId = "At most 100 characters";
  if (price && !USD.test(price)) errors.priceUsd = "Enter a USD amount such as 0.05 (up to 6 decimals), or leave blank for the default";

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    payload: { name, summary, category, tags, ...(workflowId ? { workflowId } : {}), ...(price ? { priceUsd: price } : {}) },
  };
}

export interface KeyFormValues {
  name: string;
  permissions: string[];
  /** Blank = no cap. */
  spendCapUsd: string;
  /** `YYYY-MM-DD` from a date input; blank = never. */
  expiresOn: string;
}

export interface KeyFormResult {
  errors: Partial<Record<keyof KeyFormValues, string>>;
  payload?: { name: string; permissions: string[]; spendCapUsd?: string; expiresAt?: string };
}

/** M4.8. A date picker gives a day; the key expires at the end of that day (UTC). */
export function validateKeyForm(v: KeyFormValues, now = Date.now()): KeyFormResult {
  const errors: KeyFormResult["errors"] = {};
  const name = v.name.trim();
  const cap = v.spendCapUsd.trim();

  if (!name) errors.name = "Name is required";
  else if (name.length > 100) errors.name = "At most 100 characters";
  if (v.permissions.length === 0 || v.permissions.some((p) => !(KEY_PERMISSIONS as readonly string[]).includes(p))) {
    errors.permissions = "Choose at least one permission";
  }
  if (cap && (!USD.test(cap) || Number(cap) === 0)) errors.spendCapUsd = "Enter a USD amount above 0, or leave blank for no cap";

  let expiresAt: string | undefined;
  if (v.expiresOn) {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(v.expiresOn) ? new Date(`${v.expiresOn}T23:59:59Z`) : new Date(NaN);
    if (Number.isNaN(d.getTime())) errors.expiresOn = "Enter a valid date";
    else if (d.getTime() <= now) errors.expiresOn = "Pick a date in the future";
    else expiresAt = d.toISOString();
  }

  if (Object.keys(errors).length) return { errors };
  return { errors, payload: { name, permissions: v.permissions, ...(cap ? { spendCapUsd: cap } : {}), ...(expiresAt ? { expiresAt } : {}) } };
}

export const taskTone = (s: N8nTask["status"]): Tone =>
  s === "COMPLETED" ? "active" : s === "FAILED" || s === "TIMEOUT" ? "error" : s === "CANCELED" ? "muted" : "pending";

export const toneClass = (t: Tone): string =>
  t === "active" ? "badge-active" : t === "warning" ? "badge-inactive" : t === "pending" ? "badge-pending" : t === "error" ? "badge-error" : "badge-muted";

/** M6.2: "12.5%", or a dash while no call has finished. */
export const formatRate = (rate: number | null): string => (rate === null ? "—" : `${(Math.round(rate * 1000) / 10).toString()}%`);

export interface DayBar {
  day: string;
  completed: number;
  failed: number;
  /** Cancelled and still-open calls: counted in `calls`, neither completed nor failed. */
  other: number;
  calls: number;
  revenueUsd: number;
}

/**
 * M6.2: one bar per UTC day for the last `days` days ending `endDay` (YYYY-MM-DD), zero-filled so
 * quiet days show as gaps instead of being skipped. Sums every listing in `series`.
 */
export function dailyBars(series: { day: string; calls: number; completed: number; failed: number; revenueUsd: string }[], days: number, endDay: string): DayBar[] {
  const end = Date.parse(`${endDay}T00:00:00Z`);
  const by = new Map<string, DayBar>();
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(end - i * 86_400_000).toISOString().slice(0, 10);
    by.set(day, { day, completed: 0, failed: 0, other: 0, calls: 0, revenueUsd: 0 });
  }
  for (const s of series) {
    const b = by.get(s.day);
    if (!b) continue;
    b.calls += s.calls;
    b.completed += s.completed;
    b.failed += s.failed;
    b.other += s.calls - s.completed - s.failed;
    b.revenueUsd = Math.round((b.revenueUsd + Number(s.revenueUsd)) * 1e6) / 1e6;
  }
  return [...by.values()];
}

/** Grace periods offered when rotating a key (M6.4). */
export const GRACE_OPTIONS = [
  { hours: 1, label: "1 hour" },
  { hours: 24, label: "24 hours" },
  { hours: 168, label: "7 days" },
  { hours: 0, label: "Immediately" },
] as const;
