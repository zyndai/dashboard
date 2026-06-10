import { Navbar } from "@/components/Navbar";
import { WebflowInit } from "@/components/WebflowInit";
import { Footer } from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How ZyndAI collects, uses, and protects your information — including account data, cryptographic keys, agent registry records, and analytics.",
  path: "/privacy-policy",
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LEGAL_PAGE_CSS }} />
      <div className="legal-page-w">
        <WebflowInit />
        <Navbar />
        <main className="legal-page">
          <div className="legal-eyebrow">Legal</div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-effective">Effective {EFFECTIVE_DATE}</p>

          <p className="legal-intro">
            ZyndAI (&ldquo;<strong>ZyndAI</strong>&rdquo;, &ldquo;<strong>we</strong>&rdquo;,{" "}
            &ldquo;<strong>us</strong>&rdquo;) operates the open agent network at zynd.ai — including the
            developer dashboard, Agent DNS registry, Python and TypeScript SDKs, and supporting APIs
            (collectively, the &ldquo;<strong>Service</strong>&rdquo;). This Privacy Policy describes
            exactly what information we collect, how we use it, who we share it with, and what rights you
            have over it.
          </p>

          {/* ── 1 ── */}
          <h2>1. Information we collect</h2>

          <h3>1.1 Account and profile data</h3>
          <p>
            When you sign in via <strong>Google</strong> or <strong>GitHub</strong> (through Supabase),
            we receive and store:
          </p>
          <ul>
            <li><strong>Name</strong> and <strong>email address</strong> from your OAuth provider.</li>
            <li><strong>Username</strong> — the handle you choose during onboarding.</li>
            <li><strong>Role</strong> — e.g. Developer, Researcher, Enterprise — self-reported during onboarding.</li>
            <li><strong>Country</strong> — if you choose to provide it in Settings.</li>
          </ul>
          <p>We do not receive or store your Google or GitHub password.</p>

          <h3>1.2 Developer identity and cryptographic keys</h3>
          <p>
            Each developer account generates an <strong>Ed25519 keypair</strong> used to sign agent
            registrations and authenticate with the Agent DNS network.
          </p>
          <ul>
            <li>
              Your <strong>public key</strong> is stored in our database and published to the Agent DNS
              network — it is by design publicly visible.
            </li>
            <li>
              Your <strong>private key is encrypted on your device before it is sent to us</strong>. We
              store only the ciphertext. We do not hold the decryption key and{" "}
              <strong>cannot read your private key</strong>.
            </li>
          </ul>

          <h3>1.3 Agent and service registry data</h3>
          <p>
            When you register an agent or service, the following is stored in our database and{" "}
            <strong>published to the federated Agent DNS peer-to-peer network</strong>:
          </p>
          <ul>
            <li>Agent name, description, summary, category, and tags.</li>
            <li>The public webhook URL you provide for the agent.</li>
            <li>Agent status (active / inactive) and creation timestamp.</li>
          </ul>
          <p>
            Because agent records propagate across a gossip mesh,{" "}
            <strong>treat any information in an agent registration as publicly accessible</strong>.
          </p>

          <h3>1.4 Technical and log data</h3>
          <p>When you create your account we record:</p>
          <ul>
            <li>
              Your <strong>IP address at registration</strong>, used for fraud prevention and abuse
              detection. We retain the registration IP for 12 months, after which it is deleted.
            </li>
            <li>Standard Supabase authentication event logs (login timestamps, session metadata).</li>
          </ul>

          <h3>1.5 Newsletter subscriptions</h3>
          <p>
            If you subscribe to our newsletter via the footer form, we store your{" "}
            <strong>email address only</strong>. Newsletter subscriptions are not linked to developer
            accounts unless you use the same address for both.
          </p>

          <h3>1.6 Analytics data</h3>
          <p>
            We use <strong>Google Analytics 4 (GA4)</strong> on the marketing site and dashboard. GA4
            collects anonymised behavioural data: pages visited, session duration, general geographic
            location (country/city), device type, and browser. This data is collected via cookies and is
            governed by{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google&apos;s Privacy Policy
            </a>.
          </p>

          {/* ── 2 ── */}
          <h2>2. What we do not collect</h2>
          <ul>
            <li>
              <strong>Agent activity and webhook payloads.</strong> Agent logic runs on your own
              infrastructure. We do not receive, store, or inspect messages sent to or from your agents.
            </li>
            <li>
              <strong>Payment or KYC information.</strong> The onramp widget (for funding agent wallets with
              fiat) is operated by a third-party payment provider. All card details, bank information, and
              identity verification are processed and held exclusively by that provider — we never receive
              them. We only supply the destination wallet address.
            </li>
            <li>
              <strong>Private key plaintext.</strong> The private key is encrypted before leaving your
              device. We have no technical capability to decrypt it.
            </li>
            <li>
              <strong>On-chain transaction history.</strong> While agent wallets interact with the Base
              network, we do not record or monitor on-chain transactions.
            </li>
            <li>
              <strong>Government IDs, phone numbers, biometric data,</strong> or any other special-category
              personal data.
            </li>
          </ul>

          {/* ── 3 ── */}
          <h2>3. How we use your information</h2>
          <ul>
            <li><strong>Provide the Service</strong> — authenticate your account, store agent configurations, and communicate with the Agent DNS network on your behalf.</li>
            <li><strong>Security and fraud prevention</strong> — use registration IP data to detect abuse and multiple account creation.</li>
            <li><strong>Improve the Service</strong> — analyse aggregated, anonymised usage via Google Analytics to identify bugs and prioritise features.</li>
            <li><strong>Communications</strong> — send transactional emails (account notices, security alerts). Newsletter subscribers also receive periodic updates; you may unsubscribe at any time.</li>
            <li><strong>Legal compliance</strong> — retain records as required by applicable law and respond to valid legal requests.</li>
          </ul>
          <p>We do not sell your personal data and do not use it for advertising.</p>

          {/* ── 4 ── */}
          <h2>4. How we share your information</h2>
          <p>
            We share data with the following third parties only to the extent necessary to operate the
            Service:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> — authentication and database hosting. Receives all account and
              profile data, and the encrypted private key ciphertext.
            </li>
            <li>
              <strong>Google (OAuth and Analytics)</strong> — sign-in via Google and GA4 analytics.
            </li>
            <li>
              <strong>GitHub (OAuth)</strong> — sign-in via GitHub.
            </li>
            <li>
              <strong>Onramp provider</strong> — receives only the destination agent wallet address to
              process fiat-to-crypto funding. No personal or KYC data passes through ZyndAI.
            </li>
            <li>
              <strong>Agent DNS network</strong> — your public key and agent card data are propagated
              across the federated peer-to-peer registry as part of normal operation.
            </li>
          </ul>
          <p>
            We may also disclose information if required by law, court order, or to protect the rights and
            safety of ZyndAI, our users, or the public.
          </p>

          {/* ── 5 ── */}
          <h2>5. Cookies and analytics</h2>
          <ul>
            <li>
              <strong>Supabase session cookies</strong> — strictly necessary for authentication. Cannot be
              disabled without losing access to your account.
            </li>
            <li>
              <strong>Google Analytics cookies</strong> (_ga, _gid, _gat) — anonymised analytics. You may
              opt out by installing the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>{" "}
              or enabling Do Not Track in your browser.
            </li>
          </ul>
          <p>We do not use advertising cookies or third-party tracking pixels.</p>

          {/* ── 6 ── */}
          <h2>6. Data retention</h2>
          <ul>
            <li><strong>Account data</strong> — retained while your account is active and for up to 90 days after deletion.</li>
            <li><strong>Registration IP</strong> — deleted 12 months after account creation.</li>
            <li><strong>Agent registry records</strong> — retained until you deregister the agent. Peer nodes in the Agent DNS network may cache records; full propagation of deregistration depends on gossip convergence.</li>
            <li><strong>Newsletter emails</strong> — retained until you unsubscribe.</li>
            <li><strong>Analytics data</strong> — governed by Google&apos;s retention settings (14 months by default).</li>
          </ul>

          {/* ── 7 ── */}
          <h2>7. Your rights</h2>
          <p>
            Depending on where you live you may have the right to access, correct, delete, or export your
            personal data, and to object to certain processing. California residents have additional rights
            under the CCPA:
          </p>
          <ul>
            <li><strong>Right to Know</strong> — request a summary of data we hold about you.</li>
            <li><strong>Right to Delete</strong> — request deletion of your personal data.</li>
            <li><strong>Right to Opt-Out of Sale</strong> — we do not sell personal data; no action required.</li>
            <li><strong>Right to Non-Discrimination</strong> — we will not discriminate against you for exercising these rights.</li>
          </ul>
          <p>
            To exercise any right, email us at the address in Section 11 with the subject
            &ldquo;Privacy Request&rdquo;. We respond within 30 days (45 days for CCPA requests).
          </p>
          <p>
            <strong>Account deletion:</strong> email us to request deletion of your account and all
            associated personal data. We cannot recover encrypted private keys after deletion — ensure you
            have a backup before requesting account closure.
          </p>

          {/* ── 8 ── */}
          <h2>8. Security</h2>
          <p>
            We use TLS in transit, encryption at rest for credentials, and access controls on our
            database. Your private key is encrypted client-side before transmission — we have no capability
            to decrypt it. If you believe your account has been compromised, contact us immediately.
          </p>

          {/* ── 9 ── */}
          <h2>9. Children</h2>
          <p>
            The Service is not directed at children under 13. We do not knowingly collect personal data
            from children under 13. If you believe a child has created an account, contact us and we will
            delete it promptly.
          </p>

          {/* ── 10 ── */}
          <h2>10. International transfers</h2>
          <p>
            ZyndAI is operated from the United States. If you access the Service from outside the US,
            your information will be transferred to and processed in the US, where data protection laws
            may differ from your home country. By using the Service you consent to this transfer.
          </p>

          {/* ── 11 ── */}
          <h2>11. Changes to this policy</h2>
          <p>
            If we make material changes, we will update the &ldquo;Effective&rdquo; date above and, where
            appropriate, notify you by email or in-product notice before the change takes effect. Continued
            use of the Service after the updated policy takes effect constitutes acceptance.
          </p>

          <hr className="legal-divider" />

          <h2>12. Contact</h2>
          <div className="legal-contact">
            <p><strong>Zynd AI Inc</strong></p>
            <p>8 The Green Ste A, Dover, DE 19901, USA</p>
            <p>
              For privacy questions or to exercise your rights, reach us via{" "}
              <a href="https://discord.gg/zyndai" target="_blank" rel="noopener noreferrer">Discord</a>,{" "}
              <a href="https://x.com/zyndai" target="_blank" rel="noopener noreferrer">X (Twitter)</a>,
              or email <a href="mailto:privacy@zyndai.com">privacy@zyndai.com</a>.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
