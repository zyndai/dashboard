/**
 * One-time claim tokens for cards published before signing in.
 *
 * An anonymous publish returns `claim_token`; the cards API only lets a
 * signed-in user take ownership of that unowned card when the same token is
 * sent back as `X-Claim-Token`. Kept in localStorage next to the
 * `zynd_my_handles` list so the creator can claim after the OAuth round-trip.
 */
const KEY = "zynd_claim_tokens";

function read(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(tokens: Record<string, string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(tokens));
  } catch {
    /* storage unavailable — claiming just won't be possible from this browser */
  }
}

export function saveClaimToken(handle: string, token: string): void {
  write({ ...read(), [handle]: token });
}

export function forgetClaimToken(handle: string): void {
  const tokens = read();
  if (handle in tokens) {
    delete tokens[handle];
    write(tokens);
  }
}

/** `{ "X-Claim-Token": … }` when this browser published `handle` anonymously. */
export function claimHeaders(handle: string): Record<string, string> {
  const token = read()[handle];
  return token ? { "X-Claim-Token": token } : {};
}
