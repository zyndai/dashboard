// Shapes returned by the Gateway's /internal/v1 (docs: zynd-n8n-gateway LLD > Dashboard → Gateway internal API).
// Dates arrive as ISO strings.

export type ListingStatus = "DRAFT" | "REGISTERING" | "ACTIVE" | "INACTIVE" | "ERROR";
export type HeartbeatStatus = "CONNECTING" | "ACTIVE" | "RECONNECTING" | "FAILED" | "STOPPED";

export interface N8nListing {
  id: string;
  name: string;
  summary: string;
  category: string;
  tags: string[];
  entityId: string | null;
  entityUrl: string | null;
  webhookUrl: string | null;
  workflowId: string | null;
  /** Decimal USD per inbound call; null = Gateway default; "0" = free. */
  priceUsd: string | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  heartbeat: { status: HeartbeatStatus; lastBeatAt: string | null; failCount: number } | null;
}

export interface N8nApiKey {
  id: string;
  name: string;
  /** First 8 characters; the rest of the key is never stored. */
  keyPrefix: string;
  permissions: string[];
  spendCapUsd: string | null;
  spentUsd: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

/** Only in the response to creating a key. */
export interface CreatedN8nApiKey extends N8nApiKey {
  key: string;
}

/** Response to rotating a key: the replacement (with its plaintext) and the old key, now expiring. */
export interface RotatedN8nApiKey extends CreatedN8nApiKey {
  previous: N8nApiKey;
}

/** M6.2: one listing's inbound calls on one UTC day. */
export interface DailyStat {
  day: string; // YYYY-MM-DD
  listingId: string | null;
  calls: number;
  completed: number;
  failed: number;
  revenueUsd: string;
}

export interface ListingTotals {
  listingId: string | null;
  calls: number;
  completed: number;
  failed: number;
  /** failed / (completed + failed); null while nothing has finished. */
  errorRate: number | null;
  revenueUsd: string;
}

export interface N8nAnalytics {
  days: number;
  since: string;
  series: DailyStat[];
  totals: ListingTotals[];
}

export interface N8nTask {
  id: string;
  listingId: string | null;
  direction: "INBOUND" | "OUTBOUND";
  callerId: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "TIMEOUT" | "CANCELED";
  paymentUsd: string | null;
  paymentTxn: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface N8nWallet {
  payer: string;
  /** Decimal USD; null when the balance could not be read right now. */
  payerBalanceUsd: string | null;
  listings: { listingId: string; name: string; address: string; balanceUsd: string | null }[];
}

export const KEY_PERMISSIONS = ["search", "call", "complete"] as const;
export type KeyPermission = (typeof KEY_PERMISSIONS)[number];
