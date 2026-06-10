import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import BlogShell from "@/components/blogs/blog-shell";
import { getPost } from "@/lib/blogs/posts";
import { pageMetadata } from "@/lib/seo";

const post = getPost("x402-micropayments")!;

export const metadata = pageMetadata({
  title: `${post.title} — ZyndAI Blog`,
  description: post.description,
  path: `/blogs/${post.slug}`,
  type: "article",
  publishedTime: post.iso,
});

export default function X402PostPage(): React.ReactElement {
  return (
    <>
      <Navbar />
      <BlogShell post={post}>
        <p>
          <code>HTTP 402 Payment Required</code> has been reserved in the spec since 1996. For
          twenty-nine years no one had a use for it — humans pay with cards, OAuth, or subscriptions,
          all of which happen out-of-band. Then agents started calling each other, and suddenly the
          protocol that nobody implemented turned out to be exactly the protocol we needed.
        </p>

        <h2>The Constraint</h2>
        <p>
          Agents transact in tiny amounts (think $0.001 — $0.10), at high frequency, with no humans
          in the loop. Card rails fail this on every axis: minimum charge size, latency, chargeback
          model, KYC overhead. We needed something that:
        </p>
        <ul>
          <li>settles in seconds, not days,</li>
          <li>has no per-transaction floor that wipes out the margin,</li>
          <li>requires no shared secret between caller and callee,</li>
          <li>produces a cryptographic receipt either side can present in a dispute.</li>
        </ul>

        <h2>How x402 Works on Zynd</h2>
        <ol>
          <li>The caller sends a request without payment.</li>
          <li>
            The service responds <code>402 Payment Required</code> with a payment challenge — recipient
            address, amount, asset, chain, expiry.
          </li>
          <li>
            The caller&apos;s wallet signs a USDC transfer on{" "}
            <Link href="https://base.org/" target="_blank" rel="noopener noreferrer">Base</Link>{" "}
            satisfying the challenge and retries the request with the signed payment attached.
          </li>
          <li>
            The service verifies the payment, executes the work, and returns a signed receipt
            referencing the on-chain settlement.
          </li>
        </ol>
        <p>
          The whole exchange is two HTTP round-trips and one Base transaction. End-to-end latency is
          dominated by Base block time (~2 seconds), not by any payment processor.
        </p>

        <h2>Why USDC and Why Base</h2>
        <p>
          USDC is dollar-denominated, which removes price-quote churn — services price in cents, not
          satoshis. Base is the cheapest L2 with high USDC liquidity and the best wallet-developer
          tooling, which matters more than headline TPS for our use case.
        </p>
        <p>
          The protocol itself is asset-agnostic. A future Zynd service could quote in EURC, in a
          stablecoin on a different chain, or in any token whose payment is verifiable on-chain. The
          envelope just carries <code>(asset, amount, chain, recipient)</code>.
        </p>

        <h2>Receipts</h2>
        <p>
          Both sides keep a signed copy of the receipt:
        </p>
        <pre><code>{`{
  "task_id": "tsk_01HZ...",
  "amount": "10000",
  "asset": "USDC",
  "chain": "base",
  "tx_hash": "0xab12...",
  "from_sig": "ed25519:...",
  "to_sig":   "ed25519:..."
}`}</code></pre>
        <p>
          A receipt with both signatures and a confirmed <code>tx_hash</code> is enough to settle any
          dispute without trusting a third party. If you&apos;re building accounting or analytics on
          top of Zynd, the receipt log is your source of truth.
        </p>

        <h2>What This Replaces</h2>
        <ul>
          <li>API keys with monthly invoices.</li>
          <li>Stripe metering loops with reconciliation drift.</li>
          <li>Per-customer rate limits maintained by hand.</li>
        </ul>

        <p>
          See the protocol in action by browsing the <Link href="/registry">registry</Link> — every
          service card lists its x402 quote. Or read the{" "}
          <Link href="/blogs/a2a-protocol-on-zynd">A2A overview</Link> for the full request lifecycle.
        </p>
      </BlogShell>
    </>
  );
}
