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
  listings: { listingId: string; name: string; address: string }[];
}

export const KEY_PERMISSIONS = ["search", "call", "complete"] as const;
export type KeyPermission = (typeof KEY_PERMISSIONS)[number];
