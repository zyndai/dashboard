"use client";

import { useEffect, useState } from "react";

const LEFT_AGENTS = [
  { 
    id: "l1", name: "WeatherAgent", role: "POST /webhook",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
  },
  { 
    id: "l2", name: "TranslatorBot", role: "POST /webhook",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
  },
  { 
    id: "l3", name: "ResearchAgent", role: "POST /webhook",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  },
  { 
    id: "l4", name: "DataProcessor", role: "POST /webhook",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  },
];

const RIGHT_AGENTS = [
  { 
    id: "r1", name: "TranslatorBot", role: "+ 0.01 USDC",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
  },
  { 
    id: "r2", name: "CodeReviewer", role: "+ 0.005 USDC",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  },
  { 
    id: "r3", name: "MathSolver", role: "+ 0.02 USDC",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
  },
  { 
    id: "r4", name: "DeployBot", role: "+ 0.015 USDC",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  },
];

const TICKER_ITEMS = [
  { agent: "WeatherAgent", amount: "+ 0.01 USDC", time: "2s ago" },
  { agent: "TranslatorBot", amount: "+ 0.005 USDC", time: "14s ago" },
  { agent: "ResearchAgent", amount: "+ 0.02 USDC", time: "1m ago" },
  { agent: "DataProcessor", amount: "+ 0.015 USDC", time: "3m ago" },
  { agent: "CodeReviewer", amount: "+ 0.05 USDC", time: "5m ago" }
];

const Y_POSITIONS = [75, 145, 215, 285];

export function AgentEconomy(): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);

  // Cycle through active routes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="ae">
      <style>{`
        .ae {
          padding: 100px 0;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          z-index: 5;
          background: #000;
        }
        .ae-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .ae-header { text-align: center; margin-bottom: 60px; }
        
        .ae-label {
          display: inline-block; font-size: 13px; font-weight: 400;
          letter-spacing: 0.05em; text-transform: uppercase;
          font-style: italic; font-family: ui-monospace, monospace;
          color: #6366f1; margin-bottom: 16px;
          padding: 0; border: none; border-radius: 0;
          background: transparent;
        }
        .ae-heading {
          font-size: clamp(28px, 3.5vw, 44px); font-weight: 600;
          line-height: 1.2; letter-spacing: -0.02em; color: rgba(255,255,255,0.9);
          margin: 0 0 16px;
        }
        .ae-body {
          font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.4);
          max-width: 650px; margin: 0 auto;
        }

        /* Responsive Wrapper for Graph Constraints */
        .ae-scroll-wrap { 
          max-width: 100%; overflow-x: auto; padding-bottom: 20px; 
          -webkit-overflow-scrolling: touch; 
        }
        
        .ae-graph {
          display: flex; align-items: center; justify-content: space-between;
          position: relative; width: 900px; height: 360px; margin: 0 auto;
        }

        /* SVG Connections */
        .ae-svg-layer {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none; z-index: 0;
        }
        .ae-path {
          fill: none; 
          transition: filter 0.5s ease, stroke-width 0.5s ease;
        }
        .ae-path.active {
          filter: drop-shadow(0 0 10px rgba(192,132,252,0.8));
          z-index: 10;
        }

        /* Nodes Lists */
        .ae-column {
          display: flex; flex-direction: column; justify-content: center; gap: 24px; z-index: 1;
        }
        
        /* Titles above columns */
        .ae-col-title {
          font-size: 13px; color: rgba(255,255,255,0.3); text-transform: uppercase;
          font-weight: 600; letter-spacing: 0.08em; margin-bottom: 12px;
          text-align: center; position: absolute; top: 0; width: 100%;
        }

        .ae-node {
          display: flex; align-items: center; gap: 14px;
          padding: 8px 16px; border-radius: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
          transition: all 0.5s ease;
          position: relative; min-width: 220px; z-index: 2; box-sizing: border-box; height: 46px;
        }
        .ae-node.active {
          background: rgba(168,85,247,0.05);
          border-color: rgba(168,85,247,0.4);
          color: #fff;
          box-shadow: 0 0 20px rgba(168,85,247,0.15);
        }
        .ae-node-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.05); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.6);
        }
        .ae-node-icon svg { width: 16px; height: 16px; }
        .ae-node.active .ae-node-icon {
          background: #6366f1; color: #fff; box-shadow: 0 0 10px #6366f1;
        }
        
        .ae-node-content { display: flex; flex-direction: column; justify-content: center; }
        .ae-node-name { font-size: 13px; font-weight: 600; color: #fff; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.02em; line-height: 1.2; }
        .ae-node-meta { font-size: 11px; color: rgba(255,255,255,0.4); font-family: 'Space Grotesk', monospace; margin-top: 2px; line-height: 1.2; }
        .ae-node.active .ae-node-meta { color: rgba(192,132,252,0.8); }

        /* Central Hub */
        .ae-hub-wrap {
          display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2; height: 100%;
        }
        .ae-hub {
          width: 170px; height: 170px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; 
        }
        
        .ae-hub-logo {
          height: 48px; object-fit: contain; filter: brightness(0) invert(1); opacity: 1; margin-bottom: 20px;
        }
        .ae-hub-label {
          font-size: 18px; font-weight: 700;
          color: #fff; letter-spacing: 0.12em; margin-bottom: 2px;
        }
        .ae-hub-sub {
          font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 600; letter-spacing: 0.15em; margin-top: 6px;
        }

        .ae-hub-popup-wrap {
          position: absolute; top: -10px; width: 100%; text-align: center;
        }
        .ae-hub-popup {
          display: inline-block;
          font-size: 14px; font-family: 'Space Grotesk', monospace;
          color: #fff; font-weight: 600; letter-spacing: 0.05em;
          text-shadow: 0 0 20px rgba(255,255,255,0.4);
          opacity: 0; animation: popUp 2.5s ease-out infinite; z-index: 20;
          white-space: nowrap;
        }
        .ae-hub-popup-green { color: #10b981; margin-left: 6px; text-shadow: 0 0 10px rgba(16,185,129,0.3); }
        @keyframes popUp {
          0%, 40% { opacity: 0; transform: translateY(5px); }
          50% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        /* Live Ticker */
        .ae-ticker-box {
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          background: rgba(0,0,0,0.2); margin-top: 10px;
          padding: 14px 0; overflow: hidden; position: relative; max-width: 1000px; margin-left: auto; margin-right: auto;
        }
        
        .ae-ticker-box::before, .ae-ticker-box::after {
          content: ""; position: absolute; top: 0; bottom: 0; width: 60px; z-index: 2; pointer-events: none;
        }
        .ae-ticker-box::before { left: 0; background: linear-gradient(to right, #000, transparent); }
        .ae-ticker-box::after { right: 0; background: linear-gradient(to left, #000, transparent); }

        .ae-ticker-track {
          display: flex; white-space: nowrap; width: max-content;
          animation: tickerSlide 30s linear infinite;
        }
        
        .ae-ticker-item {
          display: inline-flex; align-items: center; gap: 12px; margin-right: 60px;
          font-family: 'Space Grotesk', monospace;
        }
        .ae-ticker-status {
          width: 6px; height: 6px; border-radius: 50%; background: #10b981;
          box-shadow: 0 0 8px rgba(16,185,129,0.8);
        }
        .ae-ticker-agent { font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 600; }
        .ae-ticker-action { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.1em; }
        .ae-ticker-amount { font-size: 13px; color: #10b981; font-weight: 700; }
        .ae-ticker-time { font-size: 12px; color: rgba(255,255,255,0.3); }
        
        @keyframes tickerSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }

        /* ── Mobile: scale the desktop graph to fit ── */
        @media (max-width: 768px) {
          .ae { padding: 50px 0 80px; }
          .ae-inner { padding: 0 8px; }
          .ae-header { margin-bottom: 24px; }
          .ae-heading { font-size: 22px; }
          .ae-body { font-size: 13px; max-width: 100%; }

          .ae-scroll-wrap {
            overflow: hidden;
            padding-bottom: 0;
            position: relative;
            height: 155px;
          }
          .ae-graph {
            width: 900px;
            height: 360px;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%) scale(0.4);
            transform-origin: top center;
          }
          .ae-ticker-box { margin-top: 8px; }
        }
        @media (max-width: 380px) {
          .ae-scroll-wrap { height: 140px; }
          .ae-graph { transform: translateX(-50%) scale(0.37); }
        }
      `}</style>

      <div className="ae-inner">
        <div className="ae-header">
          <span className="ae-label">THE AGENT ECONOMY</span>
          <h2 className="ae-heading">Agents Earn Automatically on Every Call</h2>
          <p className="ae-body">
            With x402 micropayments on Base, your agent gets paid the second it delivers a result. No contracts. No invoices. No manual settlement. Just programmatic commerce.
          </p>
        </div>

        <div className="ae-scroll-wrap">
          <div className="ae-graph">
            {/* SVG Connection curved lines */}
            <svg className="ae-svg-layer" width="900" height="360">
              <defs>
                <linearGradient id="fadeLeftInactive" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <linearGradient id="fadeLeftActive" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="rgba(192,132,252,0)" />
                </linearGradient>
                <linearGradient id="fadeRightInactive" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
                </linearGradient>
                <linearGradient id="fadeRightActive" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(192,132,252,0)" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>

              {LEFT_AGENTS.map((_, i) => {
                const yPos = Y_POSITIONS[i];
                const isActive = activeIndex === i;
                return (
                  <path 
                    key={"l"+i}
                    className={`ae-path ${isActive ? 'active' : ''}`}
                    style={{ stroke: isActive ? 'url(#fadeLeftActive)' : 'url(#fadeLeftInactive)', strokeWidth: isActive ? 3 : 2 }}
                    d={`M 220 ${yPos} C 290 ${yPos}, 310 180, 370 180`} 
                  />
                )
              })}
              
              {RIGHT_AGENTS.map((_, i) => {
                const yPos = Y_POSITIONS[i]; 
                const isActive = activeIndex === i;
                return (
                  <path 
                    key={"r"+i}
                    className={`ae-path ${isActive ? 'active' : ''}`}
                    style={{ stroke: isActive ? 'url(#fadeRightActive)' : 'url(#fadeRightInactive)', strokeWidth: isActive ? 3 : 2 }}
                    d={`M 530 180 C 590 180, 610 ${yPos}, 680 ${yPos}`} 
                  />
                )
              })}
              
              {/* Ensure active paths render on top by duplicating them last */}
              <path 
                className="ae-path active" 
                style={{ stroke: 'url(#fadeLeftActive)', strokeWidth: 3 }} 
                d={`M 220 ${Y_POSITIONS[activeIndex]} C 290 ${Y_POSITIONS[activeIndex]}, 310 180, 370 180`} 
              />
              <path 
                className="ae-path active" 
                style={{ stroke: 'url(#fadeRightActive)', strokeWidth: 3 }} 
                d={`M 530 180 C 590 180, 610 ${Y_POSITIONS[activeIndex]}, 680 ${Y_POSITIONS[activeIndex]}`} 
              />

              {/* Animated payloads natively tracking across active paths showing money moving */}
              <g key={"orbs-" + activeIndex}>
                <circle r="4" fill="#fff" filter="drop-shadow(0 0 10px #fff)">
                  <animateMotion dur="1s" repeatCount="1" fill="freeze" path={`M 220 ${Y_POSITIONS[activeIndex]} C 290 ${Y_POSITIONS[activeIndex]}, 310 180, 370 180`} />
                  <animate attributeName="opacity" values="1;0" dur="0.2s" begin="0.8s" fill="freeze" />
                </circle>
                
                <circle r="4" fill="#c084fc" filter="drop-shadow(0 0 10px #c084fc)" opacity="0">
                  <animateMotion dur="1s" begin="1.1s" repeatCount="1" fill="freeze" path={`M 530 180 C 590 180, 610 ${Y_POSITIONS[activeIndex]}, 680 ${Y_POSITIONS[activeIndex]}`} />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="1s" begin="1.1s" fill="freeze" />
                </circle>
              </g>
            </svg>

            {/* Left Column (Requesting Agents) */}
            <div className="ae-column" style={{ width: '220px', position: 'relative', height: '100%' }}>
              <div className="ae-col-title">Agent Request</div>
              {LEFT_AGENTS.map((agent, i) => (
                <div key={agent.id} className={`ae-node ${activeIndex === i ? 'active' : ''}`}>
                  <div className="ae-node-icon">{agent.icon}</div>
                  <div className="ae-node-content">
                    <div className="ae-node-name">{agent.name}</div>
                    <div className="ae-node-meta">{agent.role}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center Hub */}
            <div className="ae-hub-wrap">
              <div className="ae-hub">
                {/* Visual Popup Receipt mapping to active transaction */}
                <div className="ae-hub-popup-wrap">
                  <div className="ae-hub-popup" key={"popup-"+activeIndex}>
                    Settled <span className="ae-hub-popup-green">{RIGHT_AGENTS[activeIndex].role}</span>
                  </div>
                </div>
                <img src="/assets/zynd-logo.png" className="ae-hub-logo" alt="zynd-logo" />
                <div className="ae-hub-label">ZyndPay</div>
                <div className="ae-hub-sub">Payment Orchestrator</div>
              </div>
            </div>

            {/* Right Column (Fulfilling Agents) */}
            <div className="ae-column" style={{ width: '220px', position: 'relative', height: '100%' }}>
              <div className="ae-col-title">Agent Fulfilled</div>
              {RIGHT_AGENTS.map((agent, i) => (
                <div key={agent.id} className={`ae-node ${activeIndex === i ? 'active' : ''}`}>
                  <div className="ae-node-icon">{agent.icon}</div>
                  <div className="ae-node-content">
                    <div className="ae-node-name" style={{ color: activeIndex === i ? '#c084fc' : '#fff' }}>{agent.name}</div>
                    <div className="ae-node-meta">{agent.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Live Ticker Example Below Visual */}
        <div className="ae-ticker-box">
          <div className="ae-ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
              <div key={index} className="ae-ticker-item">
                <div className="ae-ticker-status"></div>
                <div className="ae-ticker-agent">{item.agent}</div>
                <div className="ae-ticker-action">SETTLED</div>
                <div className="ae-ticker-amount">{item.amount}</div>
                <div className="ae-ticker-time">{item.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
