"use client";

import React from "react";

export function DeveloperOnboarding(): React.ReactElement {
  return (
    <section className="dev-sec">
      <style>{`
        .dev-sec {
          padding: 100px 0;
          font-family: 'Space Grotesk', sans-serif;
          background: transparent;
          position: relative;
        }
        .dev-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* Header block */
        .dev-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .dev-label {
          display: inline-block;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-style: italic;
          font-family: ui-monospace, monospace;
          color: #6366f1;
          margin-bottom: 16px;
          padding: 0;
          border: none;
          border-radius: 0;
          background: transparent;
        }
        .dev-heading {
          font-size: clamp(32px, 4vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #fff;
          margin: 0 0 16px;
        }
        .dev-sub {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255,255,255,0.4);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Bento Grid */
        .dev-bento {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 992px) {
          .dev-bento {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
          .bento-tall { grid-row: auto; }
        }
        @media (max-width: 640px) {
          .dev-sec { padding: 60px 0; }
          .dev-inner { padding: 0 16px; }
          .dev-header { margin-bottom: 40px; }
          .dev-heading { font-size: 32px; }
          .dev-sub { font-size: 15px; }

          .dev-bento {
            gap: 16px;
          }
          .bento-card { min-height: auto; }
          .bc-top { padding: 24px; overflow: hidden; }
          .bc-bottom { padding: 24px; }
          .bc-bottom h3 { font-size: 16px; }
          .bc-bottom p { font-size: 13px; margin-bottom: 12px; }

          /* Code window */
          .sciphi-win { transform: scale(1); width: 100%; border-radius: 8px; }
          .sw-body, .sw-logs { font-size: 9.5px; word-break: break-word; white-space: pre-wrap; }
          
          /* MCP Diagram */
          .mcp-hub-box { padding: 10px 14px; max-width: 100%; }
        }

        /* Bento Cards */
        .bento-card {
          background-color: #0c0c0e;
          border: 1px solid #262626;
          border-radius: 0px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 343px;
          transition: all 0.4s ease;
        }
        .bento-card:hover {
          border-color: rgba(99,102,241,0.2);
        }
        .bento-tall {
          grid-column: 1;
          grid-row: 1 / span 2;
        }

        /* Card Content Layout */
        .bc-top {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background: rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .bc-bottom {
          padding: 24px;
          border-top: 1px solid rgba(255,255,255,0.03);
          z-index: 2;
          background: #060606;
        }
        .bc-bottom h3 {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }
        .bc-bottom p {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin: 0 0 16px;
          line-height: 1.5;
        }
        .bc-cta {
          display: inline-flex;
          font-size: 13px;
          font-weight: 600;
          color: #c084fc;
          text-decoration: none;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .bc-cta:hover { color: #e9d5ff; }

        /* SciPhi Style Code Window */
        .sciphi-win {
          width: 100%;
          transform: scale(1.02);
          background: #111;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          -webkit-mask-image: linear-gradient(to bottom, black 65%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 65%, transparent 100%);
          padding-bottom: 24px;
        }
        .sw-head {
          padding: 16px 20px;
          display: flex;
          gap: 6px;
        }
        .sw-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #d9d9d9; opacity: 0.15;
        }
        .sw-body {
          padding: 0 20px 24px;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 11px;
          line-height: 1.6;
          color: rgba(255,255,255,0.8);
        }
        .sw-divider {
          height: 1px; width: 100%;
          background: rgba(255,255,255,0.05);
        }
        .sw-foot {
          padding: 16px 20px 24px;
        }
        .sw-status {
          display: flex; align-items: center; gap: 12px;
          color: rgba(255,255,255,0.8);
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 11px; margin-bottom: 16px;
        }
        .sw-tag {
          background: rgba(255,255,255,0.1);
          padding: 4px 8px; border-radius: 2px;
          color: rgba(255,255,255,0.4);
        }
        .sw-logs {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 10px;
          line-height: 1.6;
          color: rgba(255,255,255,0.3);
        }

        /* MCP Simplified Diagram */
        .mcp-hub-wrap {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 100%; height: 100%; gap: 6px;
        }
        .mcp-hub-box {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); 
          border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3); width: 85%; max-width: 300px;
        }
        .mcp-hub-box.primary {
          border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.05);
          box-shadow: 0 0 20px rgba(99,102,241,0.1);
        }
        .mcp-hub-icon {
          font-size: 16px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05); border-radius: 8px; flex-shrink: 0;
        }
        .mcp-hub-texts { display: flex; flex-direction: column; }
        .mcp-hub-title { font-weight: 600; color: #fff; font-size: 12px; }
        .mcp-hub-sub { color: rgba(255,255,255,0.4); font-size: 10px; margin-top: 1px;}
        
        .mcp-hub-arrow {
          width: 2px; height: 8px; background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(99,102,241,0.5));
        }

        /* Authentic n8n Graphic Layout */
        .nw-canvas {
          width: 100%; height: 100%; position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .nw-wrap {
          width: 600px; height: 320px; position: absolute;
          left: 50%; top: 50%; transform: translate(-50%, -50%) scale(0.6);
        }
        @media (max-width: 600px) {
          .nw-wrap { transform: translate(-50%, -50%) scale(0.5); }
        }
        .nw-line {
          stroke: #333; stroke-width: 4; fill: none;
        }
        .nw-box {
          position: absolute; display: flex; align-items: center; justify-content: center;
          border-radius: 16px; background: #111; border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 2;
        }
        .nw-center {
          background: linear-gradient(135deg, #6366f1, #3730a3); color: #fff; 
          flex-direction: column; text-align: center; border: none;
          box-shadow: 0 10px 40px rgba(99,102,241,0.3); z-index: 3;
        }
        .nw-title { font-weight: 800; font-size: 24px; line-height: 1.1; margin-bottom: 6px; letter-spacing: -0.02em; font-family: -apple-system, sans-serif;}
        .nw-sub { font-weight: 400; font-size: 13px; font-style: italic; opacity: 0.9; }
      `}</style>
      
      <div className="dev-inner">
        <div className="dev-header">
          <span className="dev-label">Developer Onboarding</span>
          <h2 className="dev-heading">Start Building in Minutes</h2>
          <p className="dev-sub">
            Connect to the network using the tools you already know. Choose your integration path:
          </p>
        </div>

        <div className="dev-bento">
          {/* Card 1: Python SDK */}
          <div className="bento-card bento-tall">
            <div className="bc-top">
               <div className="sciphi-win">
                 <div className="sw-head"><div className="sw-dot"/><div className="sw-dot"/><div className="sw-dot"/></div>
                 <div className="sw-body">
                   from zyndai import register_agent<br/><br/>
                   register_agent(<br/>
                   &nbsp;&nbsp;name="ResearchBot",<br/>
                   &nbsp;&nbsp;capabilities=["search", "summarize"],<br/>
                   &nbsp;&nbsp;price="0.02" # USDC per call<br/>
                   )<br/><br/>
                   # Agent configuration complete
                 </div>
                 <div className="sw-divider"></div>
                 <div className="sw-foot">
                    <div className="sw-status"><span className="sw-tag">NORMAL</span> server.js</div>
                    <div className="sw-logs">
                       # Server log:<br/>
                       # 2024-12-04 17:24:59 - Successful ingestion for agent_id:<br/>
                       c3291abf-8a4e-5d9d-80fd-232ef6fd8526, with endpoints: 2<br/>
                       # 2024-12-04 17:24:59 - "**POST /v3/network HTTP/1.1**" 200 OK<br/>
                       # 2024-12-04 17:25:02 - Retrieved registry mappings successfully<br/>
                       # 2024-12-04 17:25:03 - Connected to ZyndPay L2 router
                    </div>
                 </div>
               </div>
            </div>
            <div className="bc-bottom">
              <h3 style={{textTransform:'uppercase'}}>Python SDK</h3>
              <p>Full control for code-native agents. Works seamlessly with LangChain, CrewAI, and LangGraph.</p>
              <a href="https://docs.zynd.ai" target="_blank" rel="noopener noreferrer" className="bc-cta" style={{marginTop:'4px'}}>View SDK Docs ↗</a>
            </div>
          </div>

          {/* Card 2: MCP Server */}
          <div className="bento-card">
            <div className="bc-top" style={{minHeight: '240px'}}>
               <div className="mcp-hub-wrap">
                   <div className="mcp-hub-box">
                      <div className="mcp-hub-icon">🤖</div>
                      <div className="mcp-hub-texts">
                         <div className="mcp-hub-title">Your AI Assistant</div>
                         <div className="mcp-hub-sub">Claude Desktop, Cursor, or Cline</div>
                      </div>
                   </div>
            
                   <div className="mcp-hub-arrow"></div>
            
                   <div className="mcp-hub-box primary">
                      <div className="mcp-hub-icon" style={{background: 'rgba(99,102,241,0.1)', color: '#6366f1'}}>🔌</div>
                      <div className="mcp-hub-texts">
                         <div className="mcp-hub-title">Zynd MCP Server</div>
                         <div className="mcp-hub-sub">Seamless integration layer</div>
                      </div>
                   </div>
            
                   <div className="mcp-hub-arrow" style={{background: 'linear-gradient(to bottom, rgba(99,102,241,0.5), rgba(255,255,255,0.1))'}}></div>
            
                   <div className="mcp-hub-box">
                      <div className="mcp-hub-icon" style={{background: 'rgba(59,130,246,0.1)', color: '#3b82f6'}}>🌐</div>
                      <div className="mcp-hub-texts">
                         <div className="mcp-hub-title">Global Agent Network</div>
                         <div className="mcp-hub-sub">Instant access to specialized agents</div>
                      </div>
                   </div>
               </div>
            </div>
            <div className="bc-bottom">
              <h3 style={{textTransform:'uppercase'}}>MCP Server</h3>
              <p>Give any MCP client the ability to search, discover, and call network agents directly.</p>
              <a href="https://docs.zynd.ai" target="_blank" rel="noopener noreferrer" className="bc-cta" style={{marginTop:'4px'}}>View MCP Setup ↗</a>
            </div>
          </div>

          {/* Card 3: n8n Graphic Mimic */}
          <div className="bento-card">
            <div className="bc-top" style={{padding:0, minHeight: '240px'}}>
               <div className="nw-canvas">
                  <div className="nw-wrap">
                     <svg viewBox="0 0 600 320" style={{position:'absolute', inset:0, zIndex:1}}>
                        {/* Top Left to Center */}
                        <path className="nw-line" d="M 115 100 L 115 130 Q 115 140, 125 140 L 170 140" />
                        {/* Bottom Left to Center */}
                        <path className="nw-line" d="M 115 220 L 115 190 Q 115 180, 125 180 L 170 180" />
                        {/* Bottom Middle to Center */}
                        <path className="nw-line" d="M 300 230 L 300 210" />
                        {/* Top Right to Center */}
                        <path className="nw-line" d="M 485 100 L 485 130 Q 485 140, 475 140 L 430 140" />
                        {/* Bottom Right to Center */}
                        <path className="nw-line" d="M 485 220 L 485 190 Q 485 180, 475 180 L 430 180" />
                     </svg>

                     <div className="nw-box" style={{left: 80, top: 30, width: 64, height: 64}}>
                        <svg width="34" height="34" viewBox="0 0 24 24">
                          <defs>
                            <linearGradient id="gemini-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#4285F4"/>
                              <stop offset="50%" stopColor="#9B72CB"/>
                              <stop offset="100%" stopColor="#D96570"/>
                            </linearGradient>
                          </defs>
                          <path d="M12 2 C12 7.5 16.5 12 22 12 C16.5 12 12 16.5 12 22 C12 16.5 7.5 12 2 12 C7.5 12 12 7.5 12 2 Z" fill="url(#gemini-grad)"/>
                        </svg>
                     </div>
                     
                     <div className="nw-box" style={{left: 80, top: 220, width: 64, height: 64}}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#EA4335"/></svg>
                     </div>
                     
                     <div className="nw-box" style={{left: 265, top: 230, width: 64, height: 64}}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="#2AABEE"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                     </div>

                     <div className="nw-box" style={{left: 450, top: 30, width: 64, height: 64}}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                     </div>

                     <div className="nw-box" style={{left: 450, top: 220, width: 64, height: 64}}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 3.976H5.036z"/></svg>
                     </div>

                     <div className="nw-box nw-center" style={{left: 170, top: 110, width: 260, height: 100}}>
                        <div className="nw-title" style={{fontSize: '22px'}}>Automate Agents<br/>With ZyndAI</div>
                        <div className="nw-sub" style={{marginTop:'4px', fontStyle:'normal'}}>Zero-code robust node integrations.</div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="bc-bottom">
              <h3 style={{textTransform:'uppercase'}}>n8n Nodes</h3>
              <p>5 custom n8n nodes for agent search, publishing, and x402 payments. Build workflows exactly like you're used to.</p>
              <a href="https://github.com/ZyndAI/n8n-nodes-zyndai" target="_blank" rel="noopener noreferrer" className="bc-cta" style={{marginTop:'4px'}}>Get n8n Nodes ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
