// Run with: npx tsx src/lib/n8n/n8n.test.ts  (same plain-script style as src/lib/auth/post-login.test.ts)
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { gatewayRequest } from "./gateway";
import { csrfProblem } from "./route";
import { mintSessionToken } from "./session";
import {
  formatUsd, keyState, listingBadge, maskKey, nextToggle, parseTags, shortId, validateKeyForm, validateListingForm,
} from "./format";

const SECRET = "test-session-secret-0123456789abcdef0123456789";
let n = 0;
const ok = async (name: string, fn: () => void | Promise<void>) => {
  await fn();
  n++;
  console.log("ok", name);
};

(async () => {
  // --- session token: must be exactly what the Gateway's verifySessionToken accepts -------------
  await ok("session token is HS256 with sub and exp, signed with the shared secret", () => {
    const now = 1_800_000_000_000;
    const t = mintSessionToken("zns:dev:abc", SECRET, { nowMs: now });
    const [h, p, s] = t.split(".") as [string, string, string];
    assert.deepEqual(JSON.parse(Buffer.from(h, "base64url").toString()), { alg: "HS256", typ: "JWT" });
    assert.deepEqual(JSON.parse(Buffer.from(p, "base64url").toString()), { sub: "zns:dev:abc", iat: 1_800_000_000, exp: 1_800_000_300 });
    assert.equal(s, createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url"));
  });
  await ok("session token refuses a weak secret or empty developer", () => {
    assert.throws(() => mintSessionToken("zns:dev:abc", "short"), /at least 32/);
    assert.throws(() => mintSessionToken("", SECRET), /developerId/);
  });

  // --- gateway client ---------------------------------------------------------------------------
  const env = { N8N_GATEWAY_URL: "https://gw.test/", SESSION_JWT_SECRET: SECRET };
  await ok("gatewayRequest sends the bearer token for the session's developer and the JSON body", async () => {
    let seen: { url: string; init: RequestInit } | undefined;
    const fetchImpl = (async (url: string, init: RequestInit) => {
      seen = { url, init };
      return new Response(JSON.stringify({ id: "l1" }), { status: 201 });
    }) as unknown as typeof fetch;
    const res = await gatewayRequest("zns:dev:abc", "POST", "/listings", { name: "x" }, { env, fetchImpl, nowMs: 1_800_000_000_000 });
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, { id: "l1" });
    assert.equal(seen?.url, "https://gw.test/internal/v1/listings");
    const auth = (seen?.init.headers as Record<string, string>).Authorization as string;
    assert.equal(auth, `Bearer ${mintSessionToken("zns:dev:abc", SECRET, { nowMs: 1_800_000_000_000 })}`);
    assert.equal(seen?.init.body, JSON.stringify({ name: "x" }));
  });
  await ok("gatewayRequest passes Gateway errors through unchanged", async () => {
    const fetchImpl = (async () => new Response(JSON.stringify({ error: "Listing not found", code: "NOT_FOUND" }), { status: 404 })) as unknown as typeof fetch;
    assert.deepEqual(await gatewayRequest("d", "GET", "/listings/x", undefined, { env, fetchImpl }), { status: 404, body: { error: "Listing not found", code: "NOT_FOUND" } });
  });
  await ok("gatewayRequest never forwards an HTML error page or a network error", async () => {
    const html = (async () => new Response("<html>Bad gateway</html>", { status: 502 })) as unknown as typeof fetch;
    const r1 = await gatewayRequest("d", "GET", "/listings", undefined, { env, fetchImpl: html });
    assert.equal(r1.status, 502);
    assert.ok(!JSON.stringify(r1.body).includes("<html"));
    const down = (async () => { throw new Error("ECONNREFUSED 10.0.0.5:8080"); }) as unknown as typeof fetch;
    const r2 = await gatewayRequest("d", "GET", "/listings", undefined, { env, fetchImpl: down });
    assert.equal(r2.status, 502);
    assert.ok(!JSON.stringify(r2.body).includes("10.0.0.5"));
  });
  await ok("gatewayRequest says 503 when unconfigured and sends nothing", async () => {
    let called = false;
    const fetchImpl = (async () => { called = true; return new Response("{}"); }) as unknown as typeof fetch;
    for (const bad of [{}, { N8N_GATEWAY_URL: "https://gw.test" }, { N8N_GATEWAY_URL: "https://gw.test", SESSION_JWT_SECRET: "short" }]) {
      assert.equal((await gatewayRequest("d", "GET", "/listings", undefined, { env: bad, fetchImpl })).status, 503);
    }
    assert.equal(called, false);
  });

  // --- CSRF guard -------------------------------------------------------------------------------
  const req = (method: string, headers: Record<string, string>) => ({ method, headers: new Headers(headers) });
  await ok("csrfProblem: GET is open; same-origin JSON passes; cross-origin and form posts are refused", () => {
    assert.equal(csrfProblem(req("GET", { origin: "https://evil.test", host: "zynd.ai" })), null);
    assert.equal(csrfProblem(req("POST", { origin: "https://zynd.ai", host: "zynd.ai", "content-type": "application/json" })), null);
    assert.equal(csrfProblem(req("POST", { host: "zynd.ai" })), null); // no body, no origin (curl, server-side)
    assert.equal(csrfProblem(req("DELETE", { origin: "https://zynd.ai", "x-forwarded-host": "zynd.ai", host: "internal:3000" })), null);
    assert.match(csrfProblem(req("POST", { origin: "https://evil.test", host: "zynd.ai", "content-type": "application/json" })) ?? "", /Cross-origin/);
    assert.match(csrfProblem(req("POST", { origin: "https://zynd.ai", host: "zynd.ai", "content-type": "text/plain" })) ?? "", /application\/json/);
    assert.match(csrfProblem(req("POST", { origin: "not a url", host: "zynd.ai" })) ?? "", /Cross-origin/);
  });

  // --- badges, toggles, masking -----------------------------------------------------------------
  const hb = (status: "ACTIVE" | "RECONNECTING" | "FAILED" | "CONNECTING" | "STOPPED") => ({ status, lastBeatAt: null, failCount: 0 });
  await ok("listingBadge follows the heartbeat for ACTIVE listings (M4.6)", () => {
    const base = { status: "ACTIVE" as const, webhookUrl: "https://n8n/x" };
    assert.deepEqual(listingBadge({ ...base, heartbeat: hb("ACTIVE") }).label, "ACTIVE");
    assert.equal(listingBadge({ ...base, heartbeat: hb("ACTIVE") }).tone, "active");
    assert.equal(listingBadge({ ...base, heartbeat: hb("RECONNECTING") }).label, "RECONNECTING");
    assert.equal(listingBadge({ ...base, heartbeat: hb("FAILED") }).tone, "error");
    assert.equal(listingBadge({ ...base, heartbeat: hb("CONNECTING") }).label, "CONNECTING");
    assert.equal(listingBadge({ ...base, heartbeat: null }).label, "CONNECTING");
    assert.equal(listingBadge({ status: "ACTIVE", webhookUrl: null, heartbeat: null }).label, "NO WORKFLOW");
  });
  await ok("listingBadge for the other states", () => {
    for (const s of ["DRAFT", "REGISTERING", "INACTIVE", "ERROR"] as const) {
      assert.equal(listingBadge({ status: s, webhookUrl: null, heartbeat: null }).label, s);
    }
  });
  await ok("nextToggle", () => {
    assert.equal(nextToggle("ACTIVE"), "deactivate");
    for (const s of ["DRAFT", "INACTIVE", "ERROR"] as const) assert.equal(nextToggle(s), "activate");
    assert.equal(nextToggle("REGISTERING"), null);
  });
  await ok("maskKey shows only the stored prefix", () => {
    assert.equal(maskKey("zk_aBcDe"), "zk_aBcDe••••••••••••");
  });
  await ok("keyState", () => {
    const now = Date.parse("2030-01-01T00:00:00Z");
    assert.equal(keyState({ revokedAt: "2029-01-01T00:00:00Z", expiresAt: null }, now), "revoked");
    assert.equal(keyState({ revokedAt: null, expiresAt: "2029-01-01T00:00:00Z" }, now), "expired");
    assert.equal(keyState({ revokedAt: null, expiresAt: "2031-01-01T00:00:00Z" }, now), "active");
    assert.equal(keyState({ revokedAt: null, expiresAt: null }, now), "active");
  });
  await ok("formatUsd, shortId, parseTags", () => {
    assert.equal(formatUsd("0.050000"), "$0.05");
    assert.equal(formatUsd("0.000125"), "$0.000125");
    assert.equal(formatUsd("12.000000"), "$12.00");
    assert.equal(formatUsd(null), "—");
    assert.equal(shortId("zns:0123456789abcdef0123456789abcdef"), "zns:012345…abcdef");
    assert.equal(shortId("short"), "short");
    assert.deepEqual(parseTags(" a, b ,,a,  c "), ["a", "b", "c"]);
  });

  // --- forms ------------------------------------------------------------------------------------
  const goodListing = { name: " Weather ", summary: "Forecasts", category: "general", tags: "w, rain", workflowId: "", priceUsd: "" };
  await ok("listing form builds the Gateway payload and trims (M4.7)", () => {
    assert.deepEqual(validateListingForm(goodListing).payload, { name: "Weather", summary: "Forecasts", category: "general", tags: ["w", "rain"] });
    assert.deepEqual(validateListingForm({ ...goodListing, workflowId: "wf_1", priceUsd: "0.05" }).payload, {
      name: "Weather", summary: "Forecasts", category: "general", tags: ["w", "rain"], workflowId: "wf_1", priceUsd: "0.05",
    });
    assert.equal(validateListingForm({ ...goodListing, priceUsd: "0" }).payload?.priceUsd, "0"); // free is allowed
  });
  await ok("listing form rejects what the Gateway would reject", () => {
    const bad = (f: Partial<typeof goodListing>) => validateListingForm({ ...goodListing, ...f });
    assert.ok(bad({ name: "" }).errors.name);
    assert.ok(bad({ name: "x".repeat(101) }).errors.name);
    assert.ok(bad({ summary: "x".repeat(301) }).errors.summary);
    assert.ok(bad({ category: "" }).errors.category);
    assert.ok(bad({ tags: Array.from({ length: 11 }, (_, i) => `t${i}`).join(",") }).errors.tags);
    assert.ok(bad({ tags: "x".repeat(41) }).errors.tags);
    for (const p of ["-1", "abc", "0.1234567", "1e3", "$5"]) assert.ok(bad({ priceUsd: p }).errors.priceUsd, p);
    assert.equal(bad({ name: "" }).payload, undefined);
  });
  const goodKey = { name: "CI", permissions: ["search", "call"], spendCapUsd: "", expiresOn: "" };
  await ok("key form builds the payload (M4.8)", () => {
    assert.deepEqual(validateKeyForm(goodKey).payload, { name: "CI", permissions: ["search", "call"] });
    const now = Date.parse("2030-01-01T00:00:00Z");
    assert.deepEqual(validateKeyForm({ ...goodKey, spendCapUsd: "5", expiresOn: "2030-06-30" }, now).payload, {
      name: "CI", permissions: ["search", "call"], spendCapUsd: "5", expiresAt: "2030-06-30T23:59:59.000Z",
    });
  });
  await ok("key form rejects bad input", () => {
    const now = Date.parse("2030-01-01T00:00:00Z");
    const bad = (f: Partial<typeof goodKey>) => validateKeyForm({ ...goodKey, ...f }, now);
    assert.ok(bad({ name: " " }).errors.name);
    assert.ok(bad({ permissions: [] }).errors.permissions);
    assert.ok(bad({ permissions: ["admin"] }).errors.permissions);
    for (const c of ["0", "-1", "abc", "1.1234567"]) assert.ok(bad({ spendCapUsd: c }).errors.spendCapUsd, c);
    assert.ok(bad({ expiresOn: "2029-12-31" }).errors.expiresOn);
    assert.ok(bad({ expiresOn: "soon" }).errors.expiresOn);
  });

  console.log(`\n${n} checks passed`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
