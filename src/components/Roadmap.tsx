"use client";

import React from 'react';

const roadmapStages = [
  {
    id: "Q1",
    status: 'Completed', 
    statusColor: '#10b981',
    title: 'Foundation & Protocol',
    items: [
      'Core Architecture',
      'DID Implementation',
      'x402 Micropayments'
    ]
  },
  {
    id: "Q2",
    status: 'Completed', 
    statusColor: '#10b981',
    title: 'SDK & Network',
    items: [
      'Python SDK',
      'Open Registry',
      'Base Sepolia'
    ]
  },
  {
    id: "Q3",
    status: 'In Progress', 
    statusColor: '#6366f1',
    title: 'Scaling & Ecosystem',
    items: [
      '1,000 Agents Onboarded',
      'Framework Integrations',
      'Semantic Discovery',
      'Developer Grants'
    ]
  },
  {
    id: "Q4",
    status: 'Upcoming', 
    statusColor: '#fff',
    title: 'Mainnet & Enterprise',
    items: [
      'Mainnet Migration',
      'Enterprise Gateways',
      'Compliance Tooling',
      'Network Federation'
    ]
  }
];

const Roadmap: React.FC = () => {
  return (
    <section className="section-padding" style={{ position: 'relative', zIndex: 10, background: 'transparent', padding: '100px 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        <div className="rm-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '64px' }}>
           <div>
             <div style={{ color: '#6366f1', textTransform: 'uppercase', fontStyle: 'italic', fontSize: '13px', marginBottom: '16px', letterSpacing: '0.05em', fontFamily: 'ui-monospace, monospace' }}>
               // ROADMAP
             </div>
             <h2 style={{ fontSize: '42px', fontWeight: 600, letterSpacing: '-0.02em', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#fff' }}>
               What&apos;s Next
             </h2>
           </div>
           <div className="rm-equalizer">
             <div className="rm-eq-glow"></div>
             {[...Array(24)].map((_, i) => (
                <div key={i} className={`rm-eq-bar ${i < 13 ? 'active' : ''}`}></div>
             ))}
           </div>
        </div>

        <div className="rm-grid">
           {roadmapStages.map((stage, i) => (
              <div className={`rm-col ${stage.status === 'Completed' ? 'rm-col-completed' : ''}`} key={i}>
                 {/* CSS Connection Lines matching reference design */}
                 {i === 0 && <div className="rm-line-forward" />}
                 {i === 3 && <div className="rm-line-backward" />}

                 <div className="rm-header">
                    <div className="rm-logo">
                       <img src="/assets/zynd-logo.png" alt="ZyndAI" style={{ width: '18px', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div className="rm-q-pill" style={{ color: stage.statusColor }}>{stage.status}</div>
                 </div>

                 <div className="rm-stage-title" style={{ color: stage.statusColor }}>{stage.title}</div>
                 
                 <div className="rm-items">
                    {stage.items.map((item, j) => (
                       <div className="rm-pill" key={j}>
                          {item}
                       </div>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      </div>

      <style>{`
        .rm-top-bar { flex-wrap: wrap; gap: 32px; }
        
        .rm-equalizer {
          display: flex; gap: 6px; align-items: center; position: relative;
        }
        .rm-eq-glow {
          position: absolute; left: 40px; width: 140px; height: 50px; background: #10b981; filter: blur(30px); opacity: 0.6; pointer-events: none;
        }
        .rm-eq-bar {
          width: 8px; height: 32px; border-radius: 4px; background: rgba(255,255,255,0.1);
        }
        .rm-eq-bar.active {
          background: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.5);
        }

        .rm-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }

        .rm-col {
          background: #000;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 20px 16px 24px 16px;
          display: flex; flex-direction: column; gap: 14px;
          position: relative; z-index: 2; height: max-content;
        }
        
        .rm-col-completed {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.02);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.03);
        }

        .rm-header {
          border: 1px dashed rgba(255,255,255,0.15);
          border-radius: 40px;
          padding: 6px 14px 6px 6px;
          display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; width: max-content;
          position: relative; margin-bottom: 8px;
        }
        
        .rm-logo {
          width: 36px; height: 36px; background: #000; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        
        .rm-q-pill {
          background: #111; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 4px 16px; font-size: 13px; font-weight: 600;
        }

        .rm-stage-title {
          font-size: 16.5px; font-weight: 500; padding: 4px 4px 12px 4px; border-bottom: 1px solid #1a1a1a;
        }

        .rm-items {
          display: flex; flex-direction: column; gap: 10px;
        }
        
        .rm-pill {
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 13.5px; color: rgba(255,255,255,0.7);
          line-height: 1.4; font-weight: 400;
          transition: background 0.3s, border-color 0.3s;
        }
        .rm-pill:hover {
          background: #111; border-color: rgba(255,255,255,0.15);
        }

        /* Desktop Spline Tracking Lines */
        .rm-line-forward {
           position: absolute; top: calc(100% + 12px); left: 50%; width: calc(100% + 24px); height: 40px;
           border-left: 1px solid rgba(255,255,255,0.15); border-bottom: 1px solid rgba(255,255,255,0.15);
           border-bottom-left-radius: 16px; z-index: 0; pointer-events: none;
        }
        .rm-line-forward::before {
           content: ''; position: absolute; top: -3px; left: -3.5px; width: 6px; height: 6px; border-radius: 50%; background: #555;
        }
        .rm-line-forward::after {
           content: ''; position: absolute; bottom: -3.5px; right: -3px; width: 6px; height: 6px; border-radius: 50%; background: #555;
        }
        .rm-line-backward {
           position: absolute; top: calc(100% + 12px); right: 50%; width: calc(100% + 24px); height: 40px;
           border-right: 1px solid rgba(255,255,255,0.15); border-bottom: 1px solid rgba(255,255,255,0.15);
           border-bottom-right-radius: 16px; z-index: 0; pointer-events: none;
        }
        .rm-line-backward::before {
           content: ''; position: absolute; top: -3px; right: -3.5px; width: 6px; height: 6px; border-radius: 50%; background: #555;
        }
        .rm-line-backward::after {
           content: ''; position: absolute; bottom: -3.5px; left: -3px; width: 6px; height: 6px; border-radius: 50%; background: #555;
        }

        @media (max-width: 1200px) {
          .rm-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .rm-line-forward, .rm-line-backward { display: none; }
        }
        @media (max-width: 768px) {
          .rm-grid { 
            display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
            scrollbar-width: none; padding: 0 24px 24px 24px; margin: 0 -24px; gap: 16px;
          }
          .rm-grid::-webkit-scrollbar { display: none; }
          
          .rm-col { 
            flex: 0 0 78vw; scroll-snap-align: center; padding: 32px 24px;
            background: #08080a !important; /* Overrides green completed bg */
            border: 1px solid rgba(255,255,255,0.08) !important; /* Flat simple border */
            border-radius: 16px;
            box-shadow: none !important;
          }
          
          /* Minimalist Header */
          .rm-header {
            border: none !important; /* Remove dashed outline */
            padding: 0 !important;
            margin-bottom: 24px !important;
          }
          .rm-logo { display: none !important; } /* Hide logo for cleaner look */
          .rm-q-pill {
            padding: 6px 16px !important;
            font-size: 14px !important;
            background: rgba(255,255,255,0.03) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
          }

          /* Clean Typography inside Cards */
          .rm-stage-title {
            font-size: 22px !important;
            border-bottom: none !important;
            padding: 0 !important;
            margin-bottom: 20px !important;
            letter-spacing: -0.01em;
          }
          
          /* List style instead of Nested Boxes */
          .rm-items { gap: 12px !important; }
          .rm-pill {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            font-size: 15px !important;
            color: rgba(255,255,255,0.6) !important;
            display: flex; align-items: center; gap: 12px;
          }
          .rm-pill::before {
            content: "→";
            color: rgba(255,255,255,0.2);
            font-family: ui-monospace, SFMono-Regular, monospace;
          }
          
          .rm-grid::before, .rm-grid::after { content: ""; flex: 0 0 1vw; }
        }
        @media (max-width: 600px) {
          .rm-col { flex: 0 0 85vw; }
          .rm-top-bar { flex-direction: column; align-items: flex-start; margin-bottom: 32px !important; gap: 16px; }
          .rm-top-bar h2 { font-size: 32px !important; }
          .rm-equalizer { align-self: flex-start; }
          .rm-eq-bar { width: 5px; height: 22px; }
          .section-padding { padding: 60px 0 !important; }
        }
      `}</style>
    </section>
  );
};

export default Roadmap;
