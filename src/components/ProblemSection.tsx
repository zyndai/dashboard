"use client";

import React from 'react';
import { DottedMap } from './DottedMap';

export function ProblemSection(): React.ReactElement {
  return (
    <section className="zp" style={{ background: 'transparent' }}>
      <style>{`
        .zp { padding: 0 0 120px; position: relative; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .zp-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; position: relative; z-index: 10; }
        
        /* Header */
        .zp-header { text-align: left; margin-bottom: 56px; }
        .zp-heading {
          font-size: clamp(36px, 4.5vw, 42px); font-weight: 700;
          line-height: 1.2; letter-spacing: -0.01em; color: #fff;
          margin: 0 0 12px; max-width: 700px;
        }
        .zp-body {
          font-size: 18px; line-height: 1.6; color: rgba(255,255,255,0.5);
          max-width: 650px; margin: 0; font-weight: 400;
        }

        /* Bento Grid */
        .zp-bento {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 20px;
        }
        .zp-card {
          border-radius: 12px; padding: 32px;
          position: relative; overflow: hidden;
          background: #000;
          border: 1px solid rgba(255,255,255,0.15); /* Explicit thin grey border strictly requested */
          display: flex; flex-direction: column;
        }
        
        .zp-card-content { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }
        .zp-card-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }

        .zp-c1 { grid-column: 1 / 8; }
        .zp-c2 { grid-column: 8 / 13; }
        .zp-c3 { grid-column: 1 / 5; }
        .zp-c4 { grid-column: 5 / 9; }
        .zp-c5 { grid-column: 9 / 13; }

        /* General Card Typography */
        .zp-card-title {
          font-size: 22px; font-weight: 600; color: #fff;
          line-height: 1.35; margin-bottom: 12px; letter-spacing: -0.01em;
        }
        .zp-card-desc {
          font-size: 15.5px; line-height: 1.6; color: rgba(255,255,255,0.5);
          max-width: 90%;
        }

        /* -------------------------- */
        /* Card 1: Discovery Gap      */
        /* -------------------------- */
        .zp-icon-box {
           width: 44px; height: 44px; background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.2);
           border-radius: 10px; display: flex; align-items: center; justify-content: center;
           color: #6366f1; margin-bottom: 28px;
        }
        .zp-c1-footer {
           display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 48px; border-top: 1px solid rgba(255,255,255,0.03);
        }
        .zp-c1-footer-tag {
           font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: #6366f1; font-family: 'Space Grotesk', monospace; text-transform: uppercase;
        }
        .zp-c1-footer-link {
           font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.5); text-decoration: none; display: flex; align-items: center; gap: 4px; transition: color 0.2s;
        }
        .zp-c1-footer-link:hover { color: #fff; }

        /* -------------------------- */
        /* Card 2: Trust Factor       */
        /* -------------------------- */
        .zp-c2 { align-items: center; justify-content: center; text-align: center; }
        
        .zp-stat-big {
          font-size: 80px; font-weight: 700; letter-spacing: -0.04em;
          color: #6366f1; line-height: 1; margin-bottom: 8px; position: relative; z-index: 2;
        }
        .zp-stat-label {
          font-size: 13px; font-weight: 600; letter-spacing: 0.15em; color: rgba(255,255,255,0.6);
          text-transform: uppercase; margin-bottom: 24px; position: relative; z-index: 2;
        }
        .zp-stat-sub { font-size: 15px; color: rgba(255,255,255,0.4); line-height: 1.5; padding: 0 16px; position: relative; z-index: 2; }

        /* -------------------------- */
        /* Card 3: Custom Wrappers UI */
        /* -------------------------- */
        .zp-card-terminal {
          margin-top: auto; padding-top: 32px;
        }
        .zp-terminal-inner {
          background: #000; border-radius: 6px; padding: 14px 20px; border: 1px solid rgba(255,255,255,0.05);
          font-family: 'Space Grotesk', monospace; font-size: 13px; color: #22c55e;
        }

        /* -------------------------- */
        /* Card 4: Silent Costs UI    */
        /* -------------------------- */
        .zp-progress-bar-wrap { margin-top: auto; padding-top: 32px; }
        .zp-progress-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; display: flex; }
        .zp-progress-fill { width: 55%; background: #6366f1; height: 100%; }

        @media (max-width: 1024px) {
          .zp-bento { grid-template-columns: repeat(2, 1fr); }
          .zp-c1, .zp-c2 { grid-column: 1 / 3; }
          .zp-c3, .zp-c4, .zp-c5 { grid-column: span 1; }
        }
        @media (max-width: 640px) {
          .zp { padding: 60px 0 80px; }
          .zp-inner { padding: 0 16px; }
          .zp-bento { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .zp-c1, .zp-c2 { grid-column: 1 / 3; }
          .zp-c3, .zp-c4 { grid-column: span 1; }
          .zp-c5 { grid-column: 1 / 3; }
          .zp-card { padding: 16px 14px; }
          .zp-heading { font-size: 28px; }
          .zp-body { font-size: 16px; }
          .zp-card-title { font-size: 15px; margin-bottom: 8px; }
          .zp-card-desc { font-size: 12px; max-width: 100%; line-height: 1.5; }
          .zp-stat-big { font-size: 48px; }
          .zp-stat-label { font-size: 11px; margin-bottom: 12px; }
          .zp-stat-sub { font-size: 13px; padding: 0 8px; }
          .zp-header { margin-bottom: 36px; }

          /* Hide card 1 footer on mobile */
          .zp-c1-footer { display: none; }
          /* Let text reflow naturally on mobile */
          .zp-c1 .zp-card-desc br { display: none; }

          /* Contain trust factor SVG ring */
          .zp-c2 .zp-card-bg svg { width: 180px !important; height: 180px !important; }
          .zp-c2 { min-height: 0; padding: 24px 16px; }

          /* Compact card 3/4 visuals */
          .zp-c3 .zp-card-content > div:last-child,
          .zp-c4 .zp-card-content > div:last-child { padding-top: 12px !important; }

          /* Scale down wrapper visual on mobile */
          .zp-c3-visual { gap: 4px !important; padding-top: 12px !important; }
          .zp-c3-visual > div { padding: 5px 8px !important; font-size: 10px !important; }

          /* Silent costs histogram footer tighter */
          .zp-c4 .zp-card-content > div:last-child > div:last-child { font-size: 10px !important; }

          /* Fragmented End */
          .zp-c5 .zp-card-desc { font-size: 12px; }
        }
      `}</style>

      <div className="zp-inner">
        <div className="zp-header">
          <h2 className="zp-heading">
            Agents are stuck in solitary.
          </h2>
          <p className="zp-body">
            Current architectures isolate intelligence. Zynd provides the connective tissue.
          </p>
        </div>

        <div className="zp-bento">
          {/* Card 1: Discovery Gap */}
          <div className="zp-card zp-c1" style={{ position: 'relative' }}>
            <div className="zp-card-bg" style={{ right: 0, left: 'auto', width: '70%', maskImage: 'linear-gradient(to right, transparent 0%, transparent 40%, black 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 40%, black 100%)' }}>
               <DottedMap 
                  dotColor="rgba(255,255,255,0.35)"
                  dotRadius={0.4}
               />
            </div>

            <div className="zp-card-content">
              <div className="zp-card-title">The Discovery Gap</div>
              <div className="zp-card-desc" style={{ marginBottom: '24px' }}>
                Finding another agent means knowing its exact endpoint. Zynd provides a<br />
                semantic registry where agents find collaborators based on capability, not<br />
                just address.
              </div>
              <div className="zp-c1-footer">
                 <div className="zp-c1-footer-tag">Agent Discovery</div>
                 <a href="https://docs.zynd.ai" target="_blank" rel="noopener noreferrer" className="zp-c1-footer-link">Read Docs ↗</a>
              </div>
            </div>
          </div>

          {/* Card 2: Trust Factor */}
          <div className="zp-card zp-c2">
             <div className="zp-card-bg">
                {/* Expanded ring clearing the 0% text entirely */}
                <svg width="260" height="260" viewBox="0 0 260 260" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.7 }}>
                   <circle cx="130" cy="130" r="110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
                   <path d="M 20 130 A 110 110 0 0 1 240 130" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 12" />
                   <rect x="129" y="10" width="2" height="10" fill="rgba(255,255,255,0.15)" />
                   <rect x="129" y="240" width="2" height="10" fill="rgba(255,255,255,0.15)" />
                   <rect x="10" y="129" width="10" height="2" fill="rgba(255,255,255,0.15)" />
                   <rect x="240" y="129" width="10" height="2" fill="rgba(255,255,255,0.15)" />
                </svg>
             </div>
             <div className="zp-card-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
               <div className="zp-stat-big">0%</div>
               <div className="zp-stat-label">TRUST FACTOR</div>
               <div className="zp-stat-sub">
                  In agent-to-agent interactions without verified identity.
               </div>
             </div>
          </div>

          {/* Card 3: Custom Wrappers */}
          <div className="zp-card zp-c3">
            <div className="zp-card-content">
              <div className="zp-card-title">Custom Wrappers</div>
              <div className="zp-card-desc" style={{ paddingBottom: '16px' }}>
                Writing custom code for every pair of interacting agents is a scalability nightmare.
              </div>
              <div className="zp-c3-visual" style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/assets/wrapper.svg" alt="Custom Wrappers" style={{ width: '100%', height: 'auto', maxHeight: '120px', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Card 4: Silent Costs */}
          <div className="zp-card zp-c4">
            <div className="zp-card-content">
              <div className="zp-card-title">Silent Costs</div>
              <div className="zp-card-desc" style={{ paddingBottom: '16px' }}>
                Agents can't easily charge for work or pay for resources without complex billing systems.
              </div>
              {/* Meaningful Graphic: Cost Leakage Histogram */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '50px' }}>
                    {[15, 20, 18, 28, 45, 60, 85, 100].map((val, i) => (
                      <div key={i} style={{ flex: 1, backgroundColor: i > 4 ? '#ef4444' : 'rgba(255,255,255,0.1)', height: `${val}%`, borderRadius: '2px 2px 0 0', opacity: 0.8 }}></div>
                    ))}
                 </div>
                 <div style={{ marginTop: '8px', fontSize: '12px', color: '#fca5a5', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Overhead Waste</span>
                    <span>+215%</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Card 5: The Fragmented End */}
          <div className="zp-card zp-c5">
            <div className="zp-card-content">
              <div className="zp-card-title">The Fragmented End</div>
              <div className="zp-card-desc">
                Every team protocol leads to a fragmented, expensive, and dead-end macro ecosystem.
              </div>
              
              <div className="zp-c5-visual" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/assets/fragmanted.svg" alt="Fragmented End" style={{ width: '100%', height: 'auto', maxHeight: '120px', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
