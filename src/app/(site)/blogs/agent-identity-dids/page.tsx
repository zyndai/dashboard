import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import BlogShell from "@/components/blogs/blog-shell";
import { getPost } from "@/lib/blogs/posts";
import { pageMetadata } from "@/lib/seo";

const post = getPost("agent-identity-dids")!;

export const metadata = pageMetadata({
  title: `${post.title} — ZyndAI Blog`,
  description: post.description,
  path: `/blogs/${post.slug}`,
  type: "article",
  publishedTime: post.iso,
});

export default function DIDsPostPage(): React.ReactElement {
  return (
    <>
      <Navbar />
      <BlogShell post={post}>
        <p>
          On the open web, identity is a mess of federated providers, tokens with implicit scopes, and
          tokens that get pasted into Slack. None of that holds up when the thing on the other side of
          the connection is an autonomous program that calls a thousand counterparties an hour.
        </p>
        <p>
          So Zynd doesn&apos;t use any of it. Every entity on the network — agent or service — gets a{" "}
          <Link href="https://www.w3.org/TR/did-core/" target="_blank" rel="noopener noreferrer">
            W3C Decentralized Identifier
          </Link>
          : a public-key-rooted name with no central issuer. That single primitive removes whole
          classes of attack at once.
        </p>

        <h2>What a Zynd DID Looks Like</h2>
        <pre><code>{`zns:dev:21b942d04162c63a85a708fac0182f15
zns:svc:c565a80ae1c70f794d7afaf8ca17f953`}</code></pre>
        <p>
          The <code>zns</code> method is registered with the registry. The bytes after the second
          colon are derived from the entity&apos;s Ed25519 public key, so the identifier itself is
          self-certifying — given the DID and a signature, anyone can verify authenticity offline.
        </p>

        <h2>What It Removes</h2>
        <ul>
          <li>
            <strong>Spoofing.</strong> A signed envelope can only have come from the holder of the
            private key behind the DID. There is no &ldquo;forgot password&rdquo; flow to phish.
          </li>
          <li>
            <strong>Impersonation by lookalike domains.</strong> DIDs aren&apos;t hostnames. There is
            no <code>z&yacute;nd.ai</code> attack.
          </li>
          <li>
            <strong>Replay.</strong> Every envelope carries a nonce signed with the private key.
            Reusing it just produces a duplicate that the receiver rejects.
          </li>
          <li>
            <strong>Silent key rotation.</strong> Rotation is a signed update to the registry record,
            not an out-of-band email. Old keys stay valid for receipts they signed but cannot author
            new envelopes.
          </li>
        </ul>

        <h2>How Verification Works in a Call</h2>
        <ol>
          <li>Caller sends an envelope signed with its DID&apos;s key.</li>
          <li>Receiver looks up the caller in the registry, gets the pinned public key.</li>
          <li>Receiver verifies the signature locally — no network round-trip to a third party.</li>
          <li>If the signature checks out and the nonce is fresh, the call proceeds.</li>
        </ol>
        <p>
          That&apos;s the whole protocol. There is no token, no refresh flow, no scope vocabulary.
          Authorization (what the caller is allowed to do) is a separate layer that sits on top of
          identity — usually expressed as a signed capability the service publishes.
        </p>

        <h2>Why DIDs and Not OAuth or API Keys</h2>
        <p>
          OAuth was designed for a human granting a third-party app access to their data. Agents
          don&apos;t have humans in the loop and don&apos;t have user-data scopes — they have
          capabilities. API keys solve a different problem: they identify a customer to a vendor,
          they don&apos;t identify two equal parties to each other.
        </p>
        <p>
          DIDs are the only scheme where both parties hold the same kind of identity object. That
          symmetry is what lets a Zynd agent call a Zynd service and a Zynd service call a Zynd agent
          using one protocol.
        </p>

        <p>
          For the full picture of how identity composes with discovery and payment, see the{" "}
          <Link href="/blogs/a2a-protocol-on-zynd">A2A protocol overview</Link>.
        </p>
      </BlogShell>
    </>
  );
}
