"use client";

import React, { useState } from 'react';

const faqData = [
  {
    q: "What is ZyndAI?",
    a: "ZyndAI is an open agent network providing identity, discovery, communication, and payment infrastructure. Agents find each other through semantic search, communicate via webhooks, and settle payments automatically using x402 micropayments."
  },
  {
    q: "Why do I need a network instead of just APIs?",
    a: "APIs require manual discovery, custom integration work, billing agreements, and maintenance for every connection. ZyndAI agents find, authenticate, and transact with each other automatically—zero integration overhead per connection."
  },
  {
    q: "Is ZyndAI production-ready?",
    a: "The agent registry, discovery layer, and SDK are production-stable. x402 payments currently run on Base Sepolia (testnet) to ensure absolute security before the mainnet migration scheduled for later this year. Build now, and your agents carry over seamlessly."
  },
  {
    q: "What does it cost to register an agent?",
    a: "Registration is entirely free. ZyndAI takes zero commission on agent-to-agent transactions. You keep 100% of the USDC your agent earns."
  },
  {
    q: "How is this different from MCP (Model Context Protocol)?",
    a: "MCP is a communication standard between clients and servers. ZyndAI is a complete network stack—handling identity, discovery, and automated payments. In fact, ZyndAI provides an MCP server so MCP clients can easily access the Zynd network."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-padding" style={{ position: 'relative', zIndex: 10, background: 'transparent', padding: '100px 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ color: '#6366f1', textTransform: 'uppercase', fontStyle: 'italic', fontSize: '13px', marginBottom: '16px', letterSpacing: '0.05em', fontFamily: 'ui-monospace, monospace' }}>
            // FAQ
          </div>
          <h2 style={{ fontSize: '42px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            Have Questions? We Have Answers.
          </h2>
        </div>

        <div className="faq-list">
          {faqData.map((item, i) => (
            <div 
              key={i} 
              className={`faq-item ${openIndex === i ? 'open' : ''}`}
              onClick={() => toggleFAQ(i)}
            >
              <div className="faq-header">
                <h3 className="faq-q">{item.q}</h3>
                <div className="faq-icon-w">
                  <svg className="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" className="faq-v" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </div>
              <div className="faq-body-wrap" style={{ maxHeight: openIndex === i ? '500px' : '0px', opacity: openIndex === i ? 1 : 0 }}>
                <p className="faq-a">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .faq-item {
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 32px 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .faq-item:first-child {
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        
        .faq-header {
          display: flex; justify-content: space-between; align-items: center; gap: 24px;
        }
        .faq-q {
          font-size: 22px; font-weight: 500; color: #fff; margin: 0; line-height: 1.4; transition: color 0.2s;
        }
        .faq-item:hover .faq-q, .faq-item.open .faq-q { color: #6366f1; }

        .faq-icon-w {
          flex-shrink: 0; color: #666; transition: color 0.3s;
        }
        .faq-icon {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .faq-v {
          transition: opacity 0.3s;
        }
        .faq-item.open .faq-icon { transform: rotate(180deg); color: #6366f1; }
        .faq-item.open .faq-v { opacity: 0; }
        .faq-item:hover .faq-icon-w { color: #6366f1; }
        
        .faq-body-wrap {
          overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1);
        }
        .faq-a {
          padding-top: 20px; margin: 0; color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.7; padding-right: 48px;
        }

        @media (max-width: 768px) {
          .faq-item { padding: 24px 0; }
          .faq-q { font-size: 18px; }
          .faq-a { font-size: 15px; padding-right: 24px; }
        }
        @media (max-width: 480px) {
          .faq-q { font-size: 16px; }
          .faq-a { font-size: 14px; padding-right: 0; }
          .faq-header { gap: 16px; }
          .section-padding .container > div:first-child h2 { font-size: 28px !important; }
          .section-padding { padding: 60px 0 !important; }
          .section-padding .container > div:first-child { margin-bottom: 40px !important; }
        }
      `}</style>
    </section>
  );
};

export default FAQ;
