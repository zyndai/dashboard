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

        <div className="cta-buttons-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="cta-btn-container">
             <a href="/auth" className="cta-btn-base cta-btn-primary">
                Start Building Your Agent
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 19L19 5M19 5v10M19 5H9"/></svg>
             </a>
          </div>
        </div>
      </div>
      <div style={{ height: '80px' }}></div>
    </section>
  );
};

export default CTA;
