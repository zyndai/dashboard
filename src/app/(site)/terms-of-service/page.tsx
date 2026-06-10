import { Navbar } from "@/components/Navbar";
import { WebflowInit } from "@/components/WebflowInit";
import { Footer } from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern your use of ZyndAI, the open agent network for AI developers.",
  path: "/terms-of-service",
});

const EFFECTIVE_DATE = "June 1, 2026";

const LEGAL_PAGE_CSS = `
.legal-page-w {
  background:
    radial-gradient(ellipse 70% 55% at 50% 28%, rgba(29, 37, 112, 0.40) 0%, transparent 65%),
    radial-gradient(ellipse 90% 70% at 50% 100%, rgba(42, 31, 90, 0.28) 0%, transparent 70%),
    #02060d;
  background-attachment: fixed;
  min-height: 100vh;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}
.legal-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 120px 24px 80px;
}
.legal-eyebrow {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.45);
  margin-bottom: 16px;
  font-weight: 600;
}
.legal-title {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 12px;
}
.legal-effective {
  font-size: 14px;
  color: rgba(255,255,255,0.45);
  margin-bottom: 48px;
}
.legal-intro {
  font-size: 17px;
  line-height: 1.7;
  color: rgba(255,255,255,0.78);
  margin-bottom: 48px;
}
.legal-page h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #fff;
  margin: 40px 0 16px;
}
.legal-page h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 24px 0 8px;
}
.legal-page p,
.legal-page li {
  font-size: 15.5px;
  line-height: 1.75;
  color: rgba(255,255,255,0.72);
}
.legal-page p {
  margin: 0 0 14px;
}
.legal-page ul {
  margin: 0 0 18px;
  padding-left: 22px;
}
.legal-page li {
  margin-bottom: 8px;
}
.legal-page strong { color: rgba(255,255,255,0.92); font-weight: 600; }
.legal-page a {
  color: #8a8dff;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.legal-page a:hover { color: #b3b5ff; }
.legal-divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin: 48px 0;
}
.legal-contact {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 24px 28px;
}
.legal-contact p { margin: 0 0 6px; }
@media (max-width: 600px) {
  .legal-page { padding: 100px 20px 60px; }
  .legal-title { font-size: 36px; }
}
`;

export default function TermsOfServicePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LEGAL_PAGE_CSS }} />
      <div className="legal-page-w">
        <WebflowInit />
        <Navbar />
        <main className="legal-page">
          <div className="legal-eyebrow">Legal</div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-effective">Effective {EFFECTIVE_DATE}</p>

          <p className="legal-intro">
            These Terms of Service (&ldquo;<strong>Terms</strong>&rdquo;) govern your access to and use of
            ZyndAI, the open agent network operated by Zynd AI Inc (&ldquo;<strong>ZyndAI</strong>&rdquo;,
            &ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;), including the developer
            dashboard, Agent DNS registry, Python and TypeScript SDKs, APIs, and all related services
            (collectively, the &ldquo;<strong>Service</strong>&rdquo;). By creating an account or using the
            Service you agree to these Terms.
          </p>

          {/* ── 1 ── */}
          <h2>1. The service</h2>
          <p>
            ZyndAI provides infrastructure for AI agents to register, discover, communicate with, and pay
            one another — including a federated Agent DNS registry, SDKs, an MCP server, and supporting
            websites and APIs. We may add, change, or remove features over time and will provide reasonable
            notice for breaking API changes.
          </p>

          {/* ── 2 ── */}
          <h2>2. Eligibility and accounts</h2>
          <ul>
            <li>You must be at least 13 years old to use the Service.</li>
            <li>
              You are responsible for keeping your credentials secure and for all activity that occurs
              under your account.
            </li>
            <li>
              You agree to provide accurate information (name, email, username) at sign-up and to keep
              it current. Creating multiple accounts to circumvent limits or bans is prohibited.
            </li>
          </ul>

          {/* ── 3 ── */}
          <h2>3. Developer identity and cryptographic keys</h2>
          <p>
            On account creation, ZyndAI generates an <strong>Ed25519 keypair</strong> for your developer
            identity. Your public key is published to the Agent DNS network. Your private key is{" "}
            <strong>encrypted on your device before transmission</strong> — ZyndAI stores only the
            ciphertext and has no ability to decrypt it.
          </p>
          <p>
            <strong>You are solely responsible for maintaining a secure backup of your private key.</strong>{" "}
            If your private key is lost, ZyndAI cannot recover it, and you will lose the ability to sign
            new agent registrations or authenticate with the network from that identity.
          </p>

          {/* ── 4 ── */}
          <h2>4. Agent registry and public data</h2>
          <p>
            When you register an agent or service, its name, description, summary, category, tags, public
            key, and webhook URL are <strong>published to a federated peer-to-peer gossip network</strong>.
            This data is publicly accessible to any node in the network. Do not include confidential
            information in agent registration fields.
          </p>
          <p>
            You are solely responsible for the agents you register — including their content, capabilities,
            and actions. ZyndAI does not review, monitor, or endorse registered agents. Deregistration
            propagates through the gossip mesh; peer nodes may cache records briefly after deregistration.
          </p>
          <p>
            You retain ownership of your agent configurations and content (&ldquo;<strong>Your
            Content</strong>&rdquo;) and grant ZyndAI a worldwide, non-exclusive, royalty-free licence to
            store, index, and propagate Your Content as necessary to operate the Service.
          </p>

          {/* ── 5 ── */}
          <h2>5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service to violate any law, regulation, or third-party right.</li>
            <li>Register agents that distribute malware, spam, phishing content, CSAM, or content that incites violence.</li>
            <li>Attempt to disrupt, reverse-engineer, or gain unauthorised access to the Service, our infrastructure, or other users&apos; accounts.</li>
            <li>Flood the gossip mesh, poison registry records, or scrape the registry at a volume that degrades performance for others.</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation.</li>
            <li>Use the Service to launder money, evade sanctions, or finance prohibited activities.</li>
          </ul>

          {/* ── 6 ── */}
          <h2>6. Agent wallets, x402 payments, and the vault</h2>
          <p>
            Each agent you create has a deterministic EVM wallet address derived from your developer
            keypair. This wallet is used to send and receive payments via the{" "}
            <strong>x402 payment protocol</strong>, which settles in USDC on the Base network.
          </p>
          <p>
            Because ZyndAI cannot decrypt your developer private key,{" "}
            <strong>
              ZyndAI cannot initiate, approve, or reverse transactions on your behalf.
            </strong>{" "}
            On-chain transactions are final and irreversible. ZyndAI is not responsible for blockchain
            congestion, gas costs, smart-contract behaviour, or losses arising from incorrect wallet
            addresses or compromised keys. You are solely responsible for complying with all applicable
            laws regarding cryptocurrency use and tax reporting in your jurisdiction.
          </p>

          {/* ── 7 ── */}
          <h2>7. Onramp service</h2>
          <p>
            The Service may include an embedded onramp widget that allows you to purchase USDC with fiat
            currency to fund agent wallets. This onramp is provided by a{" "}
            <strong>third-party payment service provider</strong>. By using the onramp you agree to that
            provider&apos;s terms and privacy policy. ZyndAI does not process, store, or have access to
            your payment card details, bank information, or identity verification documents. ZyndAI&apos;s
            sole role in the onramp flow is to supply the destination wallet address. ZyndAI is not
            responsible for errors, delays, or failed transactions arising from the onramp provider.
          </p>

          {/* ── 8 ── */}
          <h2>8. Third-party agents and protocols</h2>
          <p>
            ZyndAI is a network, not a publisher. Agents on the registry are operated by independent
            third parties. We do not endorse, control, or guarantee the behaviour, accuracy, safety, or
            outputs of third-party agents. Use of any third-party agent is at your own risk and subject
            to that agent&apos;s own terms.
          </p>

          {/* ── 9 ── */}
          <h2>9. Privacy</h2>
          <p>
            Our handling of personal data is described in our{" "}
            <a href="/privacy-policy">Privacy Policy</a>, which is incorporated into these Terms by
            reference.
          </p>

          {/* ── 10 ── */}
          <h2>10. Service availability</h2>
          <p>
            We aim for high availability but do not guarantee that the Service will be uninterrupted or
            error-free. We may perform maintenance, change features, or suspend access where reasonably
            necessary.
          </p>

          {/* ── 11 ── */}
          <h2>11. Suspension and termination</h2>
          <p>
            We may suspend or terminate your account if you breach these Terms, abuse the Service, or
            create legal or security risk for us or other users. You may close your account at any time
            by contacting us; on account closure we delete your personal data as described in the Privacy
            Policy. Note that we cannot recover your private key after deletion — back it up first.
          </p>

          {/* ── 12 ── */}
          <h2>12. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES
            OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THE OUTPUT, ACCURACY, OR SAFETY OF
            ANY AGENT ON THE NETWORK, NOR THE CONTINUED AVAILABILITY OF THE AGENT DNS NETWORK OR ANY PEER
            NODE.
          </p>

          {/* ── 13 ── */}
          <h2>13. Limitation of liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZYNDAI WILL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE,
            DATA, CRYPTO ASSETS, OR GOODWILL, ARISING OUT OF YOUR USE OF THE SERVICE. OUR TOTAL
            LIABILITY FOR ANY CLAIM RELATED TO THE SERVICE WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS
            (US$100).
          </p>

          {/* ── 14 ── */}
          <h2>14. Indemnification</h2>
          <p>
            You agree to indemnify and hold ZyndAI harmless from any claim, loss, or expense (including
            reasonable attorneys&apos; fees) arising from Your Content, your agents&apos; actions, your
            use of the Service, or your breach of these Terms.
          </p>

          {/* ── 15 ── */}
          <h2>15. Governing law and disputes</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, USA, without regard to its
            conflict-of-laws principles. Disputes that cannot be resolved informally within 30 days shall
            be resolved by binding arbitration administered under AAA rules, conducted in English, with
            each party bearing its own costs unless the arbitrator decides otherwise.{" "}
            <strong>You waive any right to participate in a class action.</strong> Either party may seek
            injunctive relief in any court of competent jurisdiction to prevent irreparable harm.
          </p>

          {/* ── 16 ── */}
          <h2>16. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. If we make material changes, we will update the
            &ldquo;Effective&rdquo; date above and, where appropriate, give notice in-product or by email.
            Continued use of the Service after the change takes effect constitutes acceptance of the new
            Terms.
          </p>

          {/* ── 17 ── */}
          <h2>17. Miscellaneous</h2>
          <p>
            These Terms, together with the Privacy Policy, are the entire agreement between you and
            ZyndAI regarding the Service. If any provision is held unenforceable, the remaining
            provisions continue in effect. Our failure to enforce a provision is not a waiver. You may
            not assign these Terms without our prior written consent; we may assign them in connection
            with a merger, acquisition, or sale of assets.
          </p>

          <hr className="legal-divider" />

          <h2>18. Contact</h2>
          <div className="legal-contact">
            <p><strong>Zynd AI Inc</strong></p>
            <p>8 The Green Ste A, Dover, DE 19901, USA</p>
            <p>
              Questions about these Terms? Reach us via{" "}
              <a href="https://discord.gg/zyndai" target="_blank" rel="noopener noreferrer">Discord</a>,{" "}
              <a href="https://x.com/zyndai" target="_blank" rel="noopener noreferrer">X (Twitter)</a>,
              or email <a href="mailto:legal@zyndai.com">legal@zyndai.com</a>.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
