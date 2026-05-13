import { Navbar } from "@/components/Navbar";
import { WebflowInit } from "@/components/WebflowInit";
import { Footer } from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How ZyndAI collects, uses, and protects your information. We store only your email, username, and country.",
  path: "/privacy-policy",
});

const EFFECTIVE_DATE = "May 13, 2026";

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
            ZyndAI (&ldquo;<strong>ZyndAI</strong>&rdquo;, &ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;) operates the
            open agent network at zynd.ai. We believe in collecting as little personal data as possible. This
            Privacy Policy describes exactly what we store, why we store it, and what we do not do with it.
          </p>

          <h2>1. Information we collect</h2>
          <p>We collect only the minimum information needed to run the product. Specifically:</p>
          <ul>
            <li>
              <strong>Email address</strong> — provided when you sign up, subscribe to the newsletter, or
              authenticate. Used for account access and product communication.
            </li>
            <li>
              <strong>Username</strong> — the display name you choose for your ZyndAI profile.
            </li>
            <li>
              <strong>Country</strong> — derived from your IP address at sign-in. We store the country only;
              we do not store your IP address, city, region, or precise location.
            </li>
          </ul>
          <p>
            We do not collect government IDs, phone numbers, payment card details, biometric data, or any
            special-category personal data.
          </p>

          <h2>2. How we use this information</h2>
          <ul>
            <li>Operate your account and authenticate you.</li>
            <li>Send transactional email (account, security, service notices).</li>
            <li>
              Send the newsletter, when you have explicitly subscribed. You can unsubscribe at any time via
              the link in any newsletter email.
            </li>
            <li>
              Generate aggregated, country-level usage statistics so we can understand where ZyndAI is being
              used and prioritize regional support. These statistics are internal only.
            </li>
          </ul>

          <h2>3. What we do not do</h2>
          <ul>
            <li>We do not sell your personal information.</li>
            <li>We do not share your country, username, or email with advertisers or data brokers.</li>
            <li>We do not build advertising profiles about you.</li>
            <li>We do not track your precise location.</li>
          </ul>

          <h2>4. Cookies and analytics</h2>
          <p>
            We use a small number of strictly necessary cookies to keep you signed in. We also use privacy-
            respecting product analytics (e.g. Google Analytics) to count anonymous page views and feature
            usage. Analytics data is aggregated and not used to identify individual users.
          </p>

          <h2>5. Service providers</h2>
          <p>
            Some processing is performed by trusted infrastructure providers acting on our behalf
            (for example, our hosting provider, our email-delivery provider, and our authentication
            provider). These providers only process data as needed to deliver their service to us and are
            bound by their own confidentiality and security obligations.
          </p>

          <h2>6. Data retention</h2>
          <p>
            We retain your account information for as long as your account is active. When you delete your
            account, we delete your email, username, and country from our active systems. Backups containing
            this data are rotated and overwritten on a rolling schedule.
          </p>

          <h2>7. Your rights</h2>
          <p>
            Depending on where you live (e.g. EEA, UK, California), you may have the right to access,
            correct, delete, or export your personal data, and to object to certain processing. To exercise
            any of these rights, contact us using the details below. We respond within 30 days.
          </p>

          <h2>8. Security</h2>
          <p>
            We protect your data with industry-standard safeguards including TLS in transit, encryption at
            rest for credentials, and access controls limiting employee access. No system is perfectly
            secure, but we work to keep your data safe and will notify affected users in the event of a
            material breach.
          </p>

          <h2>9. Children</h2>
          <p>
            ZyndAI is not directed at children under 13 (or under 16 in the EEA). We do not knowingly collect
            personal data from children. If you believe a child has provided us with information, contact us
            and we will delete it.
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            If we make material changes, we will update the &ldquo;Effective&rdquo; date at the top of this
            page and, where appropriate, notify you by email or in-product notice before the change takes
            effect.
          </p>

          <hr className="legal-divider" />

          <h2>11. Contact</h2>
          <div className="legal-contact">
            <p><strong>Zynd AI Inc</strong></p>
            <p>8 The Green Ste A, Dover, DE 19901, USA</p>
            <p>
              For privacy questions or to exercise your rights, reach us via{" "}
              <a href="https://discord.gg/zyndai" target="_blank" rel="noopener noreferrer">Discord</a>{" "}
              or{" "}
              <a href="https://x.com/zyndai" target="_blank" rel="noopener noreferrer">X (Twitter)</a>.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
