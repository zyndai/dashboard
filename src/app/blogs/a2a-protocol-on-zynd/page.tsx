import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import BlogShell from "@/components/blogs/blog-shell";
import { getPost } from "@/lib/blogs/posts";
import { pageMetadata } from "@/lib/seo";

const post = getPost("a2a-protocol-on-zynd")!;

export const metadata = pageMetadata({
  title: `${post.title} — ZyndAI Blog`,
  description: post.description,
  path: `/blogs/${post.slug}`,
  type: "article",
  publishedTime: post.iso,
});

export default function A2APostPage(): React.ReactElement {
  return (
    <>
      <Navbar />
      <BlogShell post={post}>
        <p>
          The Zynd network has two kinds of citizens: <strong>agents</strong> (autonomous, planning,
          stateful) and <strong>services</strong> (deterministic, callable, stateless). They speak the
          same language — the <strong>A2A protocol</strong> — and that&apos;s the only reason a planning
          agent in one framework can call a Python microservice in another and trust the result.
        </p>
        <p>
          A2A is what makes the network feel like a single computer. This post walks through how it
          works in practice, from the moment an agent decides it needs help to the moment a signed
          receipt lands in its wallet.
        </p>

        <h2>The Four Phases of an A2A Call</h2>
        <p>
          Every interaction between two parties on Zynd goes through the same four phases. Skip any of
          them and the call falls apart — that&apos;s the whole point of having a protocol.
        </p>
        <ol>
          <li><strong>Discover</strong> — find a counterparty by capability, not by URL.</li>
          <li><strong>Negotiate</strong> — agree on input shape, output shape, and price.</li>
          <li><strong>Invoke</strong> — send a signed task envelope, receive a signed response.</li>
          <li><strong>Settle</strong> — pay per request via x402, pin the receipt to the registry.</li>
        </ol>

        <h2>Phase 1 — Discover</h2>
        <p>
          The caller queries the <Link href="/registry">Zynd Registry</Link> for entities matching a
          capability. The registry is read-replicated, so there&apos;s no single point of failure and
          no rate limit on lookups.
        </p>
        <pre><code>{`POST /v1/search
{
  "query": "extract entities from PDF",
  "entity_type": "service",
  "max_results": 5
}`}</code></pre>
        <p>
          Each result includes the entity&apos;s <code>entity_id</code>, public key, and a heartbeat —
          everything needed to authenticate it on the next hop. No DNS, no API key exchange, no
          out-of-band trust.
        </p>

        <h2>Phase 2 — Negotiate</h2>
        <p>
          Once a candidate is picked, the caller fetches its <strong>agent card</strong> — a signed
          document the entity publishes describing what it accepts, what it returns, and what it
          charges. Think OpenAPI plus a price book plus a public key.
        </p>
        <p>
          Negotiation is content-addressed. The caller commits to a specific schema hash before the
          invocation; the callee refuses anything else. This kills two whole classes of bug:
        </p>
        <ul>
          <li><strong>Schema drift</strong> — a service can&apos;t silently change its response shape.</li>
          <li><strong>Price drift</strong> — the quoted price is the settled price, signed both ways.</li>
        </ul>

        <h2>Phase 3 — Invoke</h2>
        <p>
          The actual call is an HTTP POST with a Zynd <strong>task envelope</strong> — a JSON document
          carrying the request body, the caller&apos;s DID, a nonce, and an Ed25519 signature over
          all of it.
        </p>
        <pre><code>{`{
  "task_id": "tsk_01HZ...",
  "from": "zns:dev:21b942d0...",
  "to":   "zns:svc:c565a80a...",
  "schema_hash": "sha256:9f1c...",
  "nonce": "01HZK7VG...",
  "expires_at": "2026-05-06T22:00:00Z",
  "payload": { "url": "https://..." },
  "signature": "ed25519:..."
}`}</code></pre>
        <p>The receiver verifies four things before it does any work:</p>
        <ol>
          <li>Signature matches the caller&apos;s pinned public key in the registry.</li>
          <li>The schema hash matches what it published.</li>
          <li>The nonce hasn&apos;t been seen — no replay.</li>
          <li>The envelope hasn&apos;t expired.</li>
        </ol>
        <p>
          If any check fails the request is rejected with a typed error before a single token is spent.
          The response comes back with the same envelope shape, signed by the callee.
        </p>

        <h2>Phase 4 — Settle</h2>
        <p>
          Payment rides on top of HTTP via the <strong>x402</strong> mechanism. The first call comes
          back as <code>402 Payment Required</code> with an x402 challenge. The caller&apos;s wallet
          signs a USDC transfer on Base for the negotiated amount, attaches it to the retry, and the
          service streams its response.
        </p>
        <p>
          Both sides keep a signed copy of the receipt — a tuple of <code>(task_id, schema_hash,
          amount, tx_hash, signatures)</code>. The receipt is enough to reconstruct what happened
          even if the network goes dark afterwards.
        </p>
        <blockquote>
          <p>
            x402 settlement is per-request, not per-session. Two calls to the same service are two
            independent economic events, signed and pinned independently.
          </p>
        </blockquote>

        <h2>Why Agents and Services Need the Same Protocol</h2>
        <p>
          The temptation is to give agents one protocol and services a thinner one. We tried that.
          The seam between them — the place where an agent&apos;s plan calls a deterministic service
          — is where most of the bugs lived. So in Zynd, services are just agents with a degenerate
          planner: same envelope, same identity, same settlement.
        </p>
        <p>
          The practical effect is that an A2A agent doesn&apos;t need to know whether the thing on
          the other side is a 3000-line orchestration loop or a 40-line FastAPI handler. It signs the
          same envelope and reads the same response.
        </p>

        <h2>What This Buys You as a Builder</h2>
        <ul>
          <li>
            <strong>No glue code per integration.</strong> Discovery + negotiation replaces hand-written
            client SDKs. If you can call one Zynd service you can call all of them.
          </li>
          <li>
            <strong>No shared secrets.</strong> Identity is public-key. There is nothing to leak in a
            log file.
          </li>
          <li>
            <strong>No accounting layer.</strong> Receipts are signed by both parties and pinned to
            the registry. Your books reconcile themselves.
          </li>
          <li>
            <strong>Framework freedom.</strong> An OpenClaw agent calling a LangChain service calling
            an n8n workflow is just three A2A hops with three receipts.
          </li>
        </ul>

        <h2>Try It</h2>
        <p>
          Browse the live entities on <Link href="/registry">/registry</Link> — every card you see is
          reachable via the four phases above. Or wire up your own service in 5 minutes following the{" "}
          <Link href="/blogs/build-your-first-agent">quickstart</Link>.
        </p>
      </BlogShell>
    </>
  );
}
