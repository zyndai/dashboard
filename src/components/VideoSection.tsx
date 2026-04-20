"use client";

import { useEffect, useRef } from "react";

const PRODUCTS = [
  {
    title: "Discovery",
    subtitle: "Agent Registry",
    description:
      "Agents publish capabilities and find each other through semantic search. The registry matches tasks to the right specialist in milliseconds.",
    mediaUrl: "/videos/identity.mp4",
    ctaText: "Explore Registry",
    ctaUrl: "#",
  },
  {
    title: "Payments",
    subtitle: "M2M Micropayments",
    description:
      "Agents pay each other per request with USDC on Base. Instant settlement, no intermediaries, and automatic revenue for every task completed.",
    mediaUrl: "/videos/discovery.mp4",
    ctaText: "View Protocol",
    ctaUrl: "#",
  },
  {
    title: "Agent Card",
    subtitle: "Agent DIDs",
    description:
      "Every agent gets a decentralized identity with KYA verification. Prove capability, permission scope, and intent before any transaction.",
    mediaUrl: "/videos/payments.mp4",
    ctaText: "View Docs",
    ctaUrl: "https://docs.zynd.ai",
  },
] as const;

function TabIcon({ index }: { index: number }): React.ReactElement {
  const icons = [
    <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    <svg key="1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="black" fontFamily="system-ui">$</text></svg>,
    <svg key="2" viewBox="0 0 24 24" fill="currentColor"><path d="M2 4c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6l-4 4V4z" /></svg>,
    <svg key="3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>,
  ];
  return icons[index] || <></>;
}

export function VideoSection(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(-1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const triggers = container.querySelectorAll<HTMLElement>(".ss-trigger");
    const observers: IntersectionObserver[] = [];

    function setActive(index: number) {
      if (index === activeRef.current) return;
      activeRef.current = index;

      const toggle = (sel: string) => {
        container!.querySelectorAll(sel).forEach((el, i) => {
          el.classList.toggle("active", i === index);
        });
      };

      toggle(".ss-tab");
      toggle(".ss-title-item");
      toggle(".ss-media");
      toggle(".ss-desc-item");
      toggle(".ss-dot");

      container!.querySelectorAll<HTMLElement>(".ss-media").forEach((m, i) => {
        const v = m.querySelector("video");
        if (!v) return;
        if (i === index) v.play().catch(() => {});
        else v.pause();
      });
    }

    triggers.forEach((trigger, i) => {
      const obs = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) setActive(i); },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      );
      obs.observe(trigger);
      observers.push(obs);
    });

    setActive(0);
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function handleTabClick(i: number) {
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll(".ss-trigger")[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section>
      <style>{`
        .ss{position:relative}
        .ss-sticky{position:sticky;top:0;height:100vh;z-index:1;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .ss-card{width:min(90vw,1280px);height:min(85vh,720px);background:#000;border-radius:32px;display:grid;grid-template-columns:1fr 1.2fr 1fr;grid-template-rows:auto 1fr;padding:48px;position:relative;border:1px solid rgba(255,255,255,.08)}
        .ss-tabs{grid-column:3;grid-row:1;display:flex;gap:12px;justify-content:flex-end;align-items:flex-start}
        .ss-tab{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.05);outline:none;color:rgba(255,255,255,.4);transition:all .4s cubic-bezier(.16,1,.3,1)}
        .ss-tab:hover{transform:scale(1.05);background:rgba(255,255,255,.08)}
        .ss-tab.active{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)}
        .ss-tab svg{width:24px;height:24px}
        .ss-left{grid-column:1;grid-row:1/-1;display:flex;flex-direction:column}
        .ss-title-group{position:relative;min-height:120px}
        .ss-title-item{position:absolute;top:0;left:0;opacity:0;transform:translateY(15px);pointer-events:none;transition:all .6s cubic-bezier(.16,1,.3,1)}
        .ss-title-item.active{opacity:1;transform:translateY(0);pointer-events:auto}
        .ss-title{font-size:clamp(40px,5vw,64px);font-weight:700;letter-spacing:-.03em;line-height:1.1;margin-bottom:12px;background:linear-gradient(to right,#fff,#a1a1aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .ss-subtitle{font-size:14px;font-weight:600;color:#6366F1;letter-spacing:.02em}
        .ss-center{grid-column:2;grid-row:1/-1;display:flex;align-items:center;justify-content:center;position:relative}
        .ss-media-wrapper{position:relative;width:100%;height:100%;min-height:0}
        .ss-media{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.98);pointer-events:none;transition:all .6s cubic-bezier(.16,1,.3,1)}
        .ss-media.active{opacity:1;transform:scale(1);pointer-events:auto}
        .ss-media video{width:100%;height:100%;object-fit:cover;border-radius:20px;filter:invert(1)}
        .ss-right{grid-column:3;grid-row:2;display:flex;flex-direction:column;justify-content:flex-end;position:relative}
        .ss-desc-group{position:relative;min-height:200px}
        .ss-desc-item{position:absolute;bottom:0;left:0;right:0;opacity:0;transform:translateY(15px);pointer-events:none;transition:all .6s cubic-bezier(.16,1,.3,1)}
        .ss-desc-item.active{opacity:1;transform:translateY(0);pointer-events:auto}
        .ss-description{font-size:clamp(16px,1.8vw,20px);font-weight:400;line-height:1.5;margin-bottom:24px;color:#a1a1aa}
        .ss-cta{display:inline-flex;align-items:center;padding:12px 28px;border-radius:99px;font-size:14px;font-weight:600;background:#fff;color:#000;box-shadow:0 4px 14px rgba(255,255,255,.2);transition:all .3s;text-decoration:none;width:fit-content}
        .ss-cta:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,255,255,.3)}
        .ss-cta--disabled{background:rgba(255,255,255,.05);color:rgba(255,255,255,.3);box-shadow:none;pointer-events:none}
        .ss-bottom-nav{position:absolute;bottom:40px;left:48px;z-index:5;display:flex;align-items:center;gap:16px}
        .ss-bottom-logo{width:44px;height:44px;border-radius:50%;background:rgba(99,102,241,.15);display:flex;align-items:center;justify-content:center;border:1px solid rgba(99,102,241,.3)}
        .ss-bottom-logo img{width:24px;height:24px;filter:brightness(0) invert(1)}
        .ss-bottom-pill{display:flex;align-items:center;padding:4px;background:rgba(255,255,255,.03);border-radius:99px;border:1px solid rgba(255,255,255,.05)}
        .ss-bottom-pill a{padding:8px 16px;border-radius:99px;font-size:13px;font-weight:500;color:rgba(255,255,255,.6);transition:all .2s;text-decoration:none}
        .ss-bottom-pill a:hover{color:#fff;background:rgba(255,255,255,.05)}
        .ss-bottom-contact{padding:10px 20px;border-radius:99px;font-size:13px;font-weight:500;color:#fff;border:1px solid rgba(255,255,255,.1);transition:all .2s;background:rgba(255,255,255,.02);text-decoration:none}
        .ss-bottom-contact:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}
        .ss-dots{position:absolute;right:40px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:10}
        .ss-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .4s}
        .ss-dot.active{background:#6366F1;transform:scale(1.5);box-shadow:0 0 10px rgba(99,102,241,.5)}
        .ss-triggers{position:relative}
        .ss-trigger{height:45vh; scroll-snap-align: center;}
        @media(max-width:1024px){.ss-card{grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr auto;padding:32px;height:min(90vh,800px)}.ss-tabs{grid-column:2;grid-row:1}.ss-left{grid-column:1;grid-row:1}.ss-center{grid-column:1/-1;grid-row:2}.ss-right{grid-column:1/-1;grid-row:3}}
        @media(max-width:640px){
          .ss-card{
            grid-template-columns:1fr;
            grid-template-rows:auto auto auto auto;
            padding:20px 16px;
            width:92vw;
            height:auto;
            min-height:0;
            max-height:none;
            border-radius:20px;
            gap:12px;
            overflow-y:auto
          }
          .ss-tabs{grid-column:1;grid-row:1;justify-content:flex-start;gap:8px}
          .ss-left{grid-column:1;grid-row:2}
          .ss-center{grid-column:1;grid-row:3;min-height:0}
          .ss-right{grid-column:1;grid-row:4}
          .ss-tab{width:36px;height:36px;border-radius:10px}
          .ss-tab svg{width:18px;height:18px}
          .ss-title{font-size:26px}
          .ss-title-group{min-height:0;position:relative}
          .ss-title-item{position:relative;top:auto;left:auto;display:none}
          .ss-title-item.active{display:block}
          .ss-subtitle{font-size:12px}
          .ss-bottom-nav{display:none}
          .ss-dots{display:none}
          .ss-media-wrapper{position:relative;min-height:0;height:200px}
          .ss-media{border-radius:14px}
          .ss-media video{border-radius:14px}
          .ss-desc-group{min-height:0;position:relative}
          .ss-desc-item{position:relative;bottom:auto;left:auto;right:auto;display:none}
          .ss-desc-item.active{display:block;opacity:1;transform:none}
          .ss-description{font-size:14px;line-height:1.45;margin-bottom:14px}
          .ss-cta{padding:10px 20px;font-size:13px}
        }
      `}</style>

      <div className="ss" ref={containerRef}>
        <div className="ss-sticky">
          <div className="ss-card">
            <div className="ss-dots">
              {PRODUCTS.map((p) => <div key={p.title} className="ss-dot" />)}
            </div>
            <div className="ss-tabs">
              {PRODUCTS.map((p, i) => (
                <button key={p.title} className="ss-tab" aria-label={p.title} onClick={() => handleTabClick(i)}>
                  <TabIcon index={i} />
                </button>
              ))}
            </div>
            <div className="ss-left">
              <div className="ss-title-group">
                {PRODUCTS.map((p) => (
                  <div key={p.title} className="ss-title-item">
                    <h2 className="ss-title">{p.title}</h2>
                    <p className="ss-subtitle">{p.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="ss-center">
              <div className="ss-media-wrapper">
                {PRODUCTS.map((p) => (
                  <div key={p.title} className="ss-media">
                    <video src={p.mediaUrl} loop muted playsInline preload="none" />
                  </div>
                ))}
              </div>
            </div>
            <div className="ss-right">
              <div className="ss-desc-group">
                {PRODUCTS.map((p) => (
                  <div key={p.title} className="ss-desc-item">
                    <p className="ss-description">{p.description}</p>
                    <a href={p.ctaUrl} className={`ss-cta${"disabled" in p && p.disabled ? " ss-cta--disabled" : ""}`}>
                      {p.ctaText}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="ss-bottom-nav">
              <div className="ss-bottom-logo">
                <img src="/assets/zynd-logo.png" alt="ZyndAI" />
              </div>
              <div className="ss-bottom-pill">
                <a href="#">Protocol</a>
                <a href="#">Registry</a>
                <a href="#">Developers</a>
              </div>
              <a href="#" className="ss-bottom-contact">Get API Key</a>
            </div>
          </div>
        </div>
        <div className="ss-triggers">
          {PRODUCTS.map((p, i) => <div key={p.title} className="ss-trigger" style={i === PRODUCTS.length - 1 ? {height: "135vh"} : undefined} />)}
        </div>
      </div>
    </section>
  );
}
