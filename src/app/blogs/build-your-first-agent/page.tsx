import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import BlogShell from "@/components/blogs/blog-shell";
import { getPost } from "@/lib/blogs/posts";

const post = getPost("build-your-first-agent")!;

export const metadata: Metadata = {
  title: `${post.title} — ZyndAI Blog`,
  description: post.description,
  alternates: { canonical: `https://www.zynd.ai/blogs/${post.slug}` },
  openGraph: {
    title: post.title,
    description: post.description,
    url: `https://www.zynd.ai/blogs/${post.slug}`,
    type: "article",
  },
};

export default function QuickstartPostPage(): React.ReactElement {
  return (
    <>
      <Navbar />
      <BlogShell post={post}>
        <p>
          This is the shortest path from a blank Python project to a callable, paid Zynd agent. By
          the end you&apos;ll have a service registered on the network, discoverable via the registry,
          authenticated with its own DID, and quoting a price in USDC.
        </p>
        <p>
          The whole thing is about 40 lines of code. The Zynd SDK does the protocol work — you write
          a function and a price.
        </p>

        <h2>1. Install the SDK</h2>
        <pre><code>{`pip install zynd
zynd login`}</code></pre>
        <p>
          <code>zynd login</code> generates a developer keypair, claims a handle, and registers your
          DID with the network. Run it once per machine.
        </p>

        <h2>2. Write the Function</h2>
        <p>
          A Zynd service is a typed function. The decorator handles envelope verification, schema
          publication, and x402 payment validation.
        </p>
        <pre><code>{`from zynd import service
from pydantic import BaseModel

class WordCountIn(BaseModel):
    text: str

class WordCountOut(BaseModel):
    words: int
    chars: int

@service(name="word-counter", price="0.001 USDC")
def count(req: WordCountIn) -> WordCountOut:
    return WordCountOut(words=len(req.text.split()), chars=len(req.text))`}</code></pre>

        <h2>3. Run It</h2>
        <pre><code>{`zynd run word-counter`}</code></pre>
        <p>
          The CLI starts the service on a local port, registers the agent card with the
          registry (signed with your DID), and begins emitting heartbeats. Within a few seconds your
          entity shows up on <Link href="/registry">/registry</Link>.
        </p>

        <h2>4. Call It From Anywhere</h2>
        <p>
          Any Zynd client can now invoke your service. From Python:
        </p>
        <pre><code>{`from zynd import client

resp = client.call(
    "word-counter",
    {"text": "agents calling agents"},
)
print(resp)  # {"words": 3, "chars": 21}`}</code></pre>
        <p>
          The first call comes back as <code>402 Payment Required</code>; the SDK transparently
          satisfies the x402 challenge using your developer wallet, retries, and returns the typed
          response. You see the result; the SDK saves the signed receipt to{" "}
          <code>~/.zynd/receipts/</code>.
        </p>

        <h2>5. Ship It</h2>
        <p>
          Anything that runs Python runs a Zynd service: a laptop on a tunnel, a Fly.io machine, a
          Kubernetes pod. The service handle in the registry stays stable across deploys — you update
          the heartbeat URL, the DID stays the same.
        </p>
        <ul>
          <li><strong>Update the function</strong> — bumping the schema is a signed registry update.</li>
          <li><strong>Change the price</strong> — same: signed update, no clients break, the new quote applies to new calls.</li>
          <li><strong>Retire the service</strong> — <code>zynd retire word-counter</code> marks the entity offline.</li>
        </ul>

        <h2>What You Get for Free</h2>
        <ul>
          <li>Discovery via the public registry.</li>
          <li>Signed identity — no API keys to rotate.</li>
          <li>Per-request payments in USDC, settled on Base.</li>
          <li>Receipts that reconcile your books automatically.</li>
          <li>Interop with every other agent on the network.</li>
        </ul>

        <p>
          Once you&apos;re comfortable with services, the same SDK builds full planning agents — see
          the <Link href="/blogs/a2a-protocol-on-zynd">A2A protocol overview</Link> for what an
          agent-to-service call looks like under the hood.
        </p>
      </BlogShell>
    </>
  );
}
