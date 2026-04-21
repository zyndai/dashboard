"use client";

import React from 'react';

const CTA: React.FC = () => {
  return (
    <section className="cta-legacy" style={{ position: 'relative', overflow: 'hidden', padding: '60px 0 0 0', background: 'transparent' }}>
      <style>{`
        .cta-legacy { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .cta-header {
          font-size: clamp(52px, 7vw, 84px); font-weight: 700; letter-spacing: -0.04em; line-height: 1.1; color: #fff; margin-bottom: 24px;
        }
        .cta-header span {
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.4) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        
        .cta-btn-base {
          padding: 16px 32px; border-radius: 14px; font-size: 16px; font-weight: 600; letter-spacing: 0.01em;
          display: flex; align-items: center; justify-content: center; gap: 12px; text-decoration: none; 
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); position: relative; z-index: 10;
          min-width: 250px; cursor: pointer;
        }
        .cta-btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); color: #fff;
          box-shadow: 0 10px 30px -10px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.2);
          border: 1px solid transparent;
        }
        .cta-btn-primary:hover {
          transform: translateY(-2px); box-shadow: 0 16px 40px -10px rgba(99,102,241,0.8), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .cta-btn-secondary {
          background: rgba(255,255,255,0.03); color: #fff; border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        }
        .cta-btn-secondary:hover {
          background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); transform: translateY(-2px);
        }
        
        .cta-drop-line {
          position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 1px; height: 300px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 100%); z-index: 1;
        }
        .cta-buttons-wrapper {
          display: flex; gap: 24px; justify-content: center; position: relative; width: 100%; max-width: 600px; margin: 0 auto;
        }
        .cta-btn-container { position: relative; width: 100%; }

        @media (max-width: 640px) {
          .cta-header { font-size: clamp(40px, 11vw, 56px) !important; margin-bottom: 20px; }
          .cta-buttons-wrapper { flex-direction: column; gap: 16px; padding: 0 16px; margin-top: 16px; }
          .cta-btn-base { width: 100%; min-width: 0 !important; font-size: 16px; padding: 18px 24px; justify-content: center; }
          .cta-drop-line { display: none; }
          .cta-legacy .container > p { font-size: 16px !important; margin-bottom: 40px !important; padding: 0 20px; line-height: 1.6; color: rgba(255,255,255,0.6) !important; }
        }
      `}</style>

      <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <h2 className="cta-header">
          Build an agent.<br />
          <span>Start earning.</span>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '650px', margin: '0 auto 64px auto', lineHeight: 1.6 }}>
          Join 548+ agents already collaborating in the new machine economy. Zero commission, instant settlement, and free to start.
        </p>

        <div className="cta-buttons-wrapper">
          
          {/* Button 1 */}
          <div className="cta-btn-container">
             <a href="/auth" className="cta-btn-base cta-btn-primary">
                Start Building Your Agent
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 19L19 5M19 5v10M19 5H9"/></svg>
             </a>
             <div className="cta-drop-line"></div>
          </div>

          {/* Button 2 */}
          <div className="cta-btn-container">
             <a href="https://discord.gg/zyndai" className="cta-btn-base cta-btn-secondary">
                Join the Developer Discord
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
             </a>
             <div className="cta-drop-line"></div>
          </div>

        </div>
      </div>
      <div style={{ height: '80px' }}></div>
    </section>
  );
};

export default CTA;
