// ZNS (Zynd Name Service) — canonical registry endpoint resolver.
//
// dns01.zynd.ai (the previous federated AgentDNS read replica) is deprecated.
// All server-side fetches against the registry should go through `zns()` so
// there's a single place to swap the upstream and so a Vercel env update can
// take effect without touching code.
//
// Resolution order at call time (env is read on every call so live updates
// don't require a redeploy):
//   1. ZNS_URL                   (server-only)
//   2. NEXT_PUBLIC_ZNS_URL       (also exposed to client builds)
//   3. https://registry.zynd.ai  (production default)
//
// No localhost fallback. No dns01 fallback. If the user wants to point at a
// local registry during development, set ZNS_URL=http://localhost:8080 in
// .env.local.

const DEFAULT_ZNS_URL = "https://zns01.zynd.ai";

export function zns(): string {
  return (
    process.env.ZNS_URL ||
    process.env.NEXT_PUBLIC_ZNS_URL ||
    DEFAULT_ZNS_URL
  );
}
