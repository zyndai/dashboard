"use client";

import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 4000);
  };
  return (
    <footer style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Top Section: Link Clusters (Flexbox) */}
        <div className="footer-grid">
           
           {/* Block 1: Logo */}
           <div className="ft-col-1">
              <a href="/" className="navbar-brand" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: 'none', marginBottom: '16px' }}>
                <img
                  src="/assets/zynd-logo.png"
                  alt="ZyndAI"
                  style={{ width: "32px", height: "32px", filter: "brightness(0) invert(1)" }}
                />
                <span style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  color: "#fff",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>ZYND<span style={{ color: "#6366f1" }}>AI</span></span>
              </a>
           </div>

           {/* Block 2: Links */}
           <div className="footer-link-cluster">
               <div className="footer-col">
                  <h4>Resources</h4>
                  <a href="https://docs.zynd.ai/" target="_blank" rel="noopener noreferrer">Documentation</a>
                  <a href="https://www.npmjs.com/package/zyndai-mcp-server" target="_blank" rel="noopener noreferrer">MCP Server</a>
                  <a href="https://github.com/ZyndAI" target="_blank" rel="noopener noreferrer">GitHub</a>
                  <a href="https://www.zynd.ai/docs/litepaper.pdf" target="_blank" rel="noopener noreferrer">Litepaper</a>
               </div>

               <div className="footer-col">
                  <h4>Community</h4>
                  <a href="https://discord.gg/zyndai" target="_blank" rel="noopener noreferrer">Discord</a>
                  <a href="https://x.com/zyndai" target="_blank" rel="noopener noreferrer">Twitter / X</a>
                  <a href="https://www.zynd.ai/blogs" target="_blank" rel="noopener noreferrer">Blog</a>
                  <a href="/team">Team</a>
               </div>

               <div className="footer-col">
                  <h4>Legal</h4>
                  <a href="/privacy-policy">Privacy Policy</a>
                  <a href="/terms-of-service">Terms of Service</a>
               </div>
           </div>

           {/* Block 3: Newsletter */}
           <div className="footer-newsletter">
              <h4 style={{ textTransform: 'none', color: '#fff', fontSize: '15.5px', lineHeight: '1.5', marginBottom: '16px', letterSpacing: '0', fontWeight: '500' }}>
                 Subscribe to our newsletter for industry insights and company news!
              </h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                 <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe(); }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 20px', borderRadius: '40px', color: '#fff', outline: 'none', width: '100%', fontSize: '15px', flex: 1 }}
                 />
                 <button
                    onClick={handleSubscribe}
                    disabled={status === 'loading'}
                    style={{ background: '#fff', color: '#000', padding: '14px 20px', borderRadius: '40px', fontSize: '14.5px', fontWeight: 600, border: '1px solid transparent', cursor: status === 'loading' ? 'wait' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, opacity: status === 'loading' ? 0.7 : 1 }}
                 >
                    {status === 'loading' ? 'Sending...' : status === 'success' ? 'Subscribed ✓' : 'Subscribe →'}
                 </button>
              </div>
              {status === 'error' && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>Something went wrong. Please try again.</p>
              )}
           </div>

        </div>
      </div>


      <div className="container copyright-bar" style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
         <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 500 }}>
           Copyright © 2026 ZyndAI. All Rights Reserved.
         </div>
         <address style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 500, fontStyle: 'normal', lineHeight: 1.5, textAlign: 'right' }}>
           Zynd AI Inc · 8 The Green Ste A · Dover, DE 19901
         </address>
      </div>

      <style>{`
        .footer-grid {
           display: flex; justify-content: space-between; flex-wrap: wrap; gap: 40px; margin-bottom: 24px;
        }
        .footer-link-cluster {
           display: flex; gap: 80px; flex-wrap: wrap;
        }
        .footer-newsletter {
           width: 100%; max-width: 400px;
        }
        .footer-col h4 {
           color: rgba(255,255,255,0.4);
           font-size: 14px; font-weight: 600; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .footer-col a {
           display: block; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 15px; margin-bottom: 12px; font-weight: 500;
           transition: color 0.15s;
        }
        .footer-col a:hover {
           color: #6366f1;
        }
        
        .marquee-wrapper {
           display: flex; width: 100vw; overflow: hidden;
           padding: 24px 0 16px 0; background: transparent;
        }
        .marquee-content {
           display: flex; align-items: center; white-space: nowrap;
           animation: scrollMarquee 36s linear infinite;
           gap: 60px; padding-right: 60px;
        }
        .marquee-item {
           font-family: 'Space Grotesk', sans-serif;
           font-size: 160px; font-weight: 800; color: rgba(255,255,255,0.06);
           line-height: 1; letter-spacing: 0.05em; display: inline-block;
        }
        .marquee-img {
           height: 115px; width: auto; filter: brightness(0) invert(1); opacity: 0.06;
           display: block; flex-shrink: 0;
        }
        
        @keyframes scrollMarquee {
           0% { transform: translateX(0); }
           100% { transform: translateX(-100%); }
        }

        .footer-form { display: flex; gap: 8px; align-items: center; width: 100%; }
        @media (max-width: 1200px) {
           .footer-link-cluster { gap: 40px; }
        }
        @media (max-width: 900px) {
           .marquee-item { font-size: 100px; }
           .marquee-img { height: 75px !important; }
           .marquee-wrapper { padding: 20px 0 10px 0; }
        }
        @media (max-width: 600px) {
           .footer-grid { flex-direction: column; gap: 32px; margin-bottom: 16px; }
           .footer-link-cluster { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 16px; width: 100%; }
           .footer-col:last-child { grid-column: 1 / -1; }
           .footer-newsletter { max-width: 100%; }
           .footer-col h4 { margin-bottom: 12px; font-size: 13px; }
           .footer-col a { font-size: 14px; margin-bottom: 8px; }
           .footer-form { flex-direction: column; gap: 10px; }
           .footer-form button, .footer-form input { width: 100%; text-align: center; }
           
           .copyright-bar { justify-content: center !important; text-align: center; padding-top: 24px !important; padding-bottom: 32px !important; margin-top: 0px; border-top: 1px solid rgba(255,255,255,0.05); }
        }
      `}</style>
    </footer>
  );
};

export { Footer };
