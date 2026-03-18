"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function useScrollEntrance() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    gsap.set(wrapper, {
      opacity: 0,
      y: 60,
      scale: 0.95,
      rotationX: 10,
    });

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(wrapper, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 1.2,
          ease: "expo.out",
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return wrapperRef;
}

const FLOW_DASH_KEYFRAMES = `@keyframes flowDash { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }`;

export function CodeEditorPanel({ className = "" }: { className?: string }) {
  const wrapperRef = useScrollEntrance();

  return (
    <div ref={wrapperRef} className={`relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-8 perspective-1000 ${className}`}>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/15 rounded-full blur-[80px] -translate-y-1/2 -z-10" />

      <div className="w-full max-w-full sm:max-w-[520px] flex flex-col gap-3 relative z-10">
        {/* Terminal: pip install */}
        <div className="bg-[#0E0E11]/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
          <div className="h-8 border-b border-white/5 bg-white/5 flex items-center px-3 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            <span className="ml-2 text-[9px] sm:text-[10px] text-gray-500 font-mono">terminal</span>
          </div>
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#8B5CF6]">$</span>
              <span className="text-white">pip install zyndai-agent</span>
            </div>
            <div className="mt-1 text-gray-500">Successfully installed zyndai-agent-0.2.4</div>
          </div>
        </div>

        {/* Code Editor: Agent setup */}
        <div className="bg-[#0E0E11]/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl transition-transform duration-700 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <div className="h-8 border-b border-white/5 bg-white/5 flex items-center px-3 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            <span className="ml-2 text-[9px] sm:text-[10px] text-gray-500 font-mono">my_agent.py</span>
          </div>
          <div className="p-3 sm:p-4 font-mono text-[10px] sm:text-[12px] leading-relaxed">
            <div className="flex gap-2 sm:gap-3">
              <div className="text-gray-600 select-none text-right flex flex-col items-end font-mono text-[9px] sm:text-[11px]">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <div><span className="text-[#EC4899]">from</span> <span className="text-white">zyndai</span> <span className="text-[#EC4899]">import</span> <span className="text-[#8B5CF6]">AgentConfig</span>, <span className="text-[#8B5CF6]">ZyndAIAgent</span></div>
                <div className="h-[1em]" />
                <div className="text-white">config = <span className="text-[#8B5CF6]">AgentConfig</span>(</div>
                <div className="pl-4 sm:pl-6">name=<span className="text-[#F59E0B]">&quot;ResearchBot&quot;</span>,</div>
                <div className="pl-4 sm:pl-6">capabilities=[<span className="text-[#F59E0B]">&quot;research&quot;</span>, <span className="text-[#F59E0B]">&quot;summarize&quot;</span>],</div>
                <div className="pl-4 sm:pl-6">price=<span className="text-[#F59E0B]">&quot;0.001&quot;</span>,</div>
                <div className="text-white">)</div>
                <div className="h-[1em]" />
                <div className="text-white">agent = <span className="text-[#8B5CF6]">ZyndAIAgent</span>(config)</div>
                <div className="text-white">agent.<span className="text-[#3B82F6]">run</span>()</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status output */}
        <div className="bg-[#0E0E11]/90 backdrop-blur-xl border border-[#8B5CF6]/20 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-mono text-[10px] sm:text-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_rgba(191, 64, 255,0.6)] shrink-0" />
          <span className="text-[#8B5CF6]">Agent registered</span>
          <span className="text-gray-500">· DID created · Webhook active</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardPanel({ className = "" }: { className?: string }) {
  const wrapperRef = useScrollEntrance();

  return (
    <div ref={wrapperRef} className={`relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-8 perspective-1000 ${className}`}>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-violet-500/15 rounded-full blur-[80px] -translate-y-1/2 -z-10" />

      <div className="w-full max-w-full sm:max-w-[520px] flex flex-col gap-3 relative z-10">
        {/* Terminal: npx command */}
        <div className="bg-[#0E0E11]/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
          <div className="h-8 border-b border-white/5 bg-white/5 flex items-center px-3 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            <span className="ml-2 text-[9px] sm:text-[10px] text-gray-500 font-mono">terminal</span>
          </div>
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#8B5CF6]">$</span>
              <span className="text-white">npx zyndai-mcp-server</span>
            </div>
            <div className="mt-1.5 text-[#8B5CF6]">MCP Server running on stdio</div>
            <div className="text-gray-500">Registered 4 tools with Claude Desktop</div>
          </div>
        </div>

        {/* MCP Tool Cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "search_agents", desc: "Find agents by capability", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "#8B5CF6" },
            { name: "call_agent", desc: "Invoke any agent endpoint", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "#F59E0B" },
            { name: "list_agents", desc: "Browse the full registry", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", color: "#3B82F6" },
            { name: "register_agent", desc: "Publish to the network", icon: "M12 4v16m8-8H4", color: "#EC4899" },
          ].map((tool) => (
            <div
              key={tool.name}
              className="bg-[#111113]/90 backdrop-blur-xl border border-white/8 rounded-lg p-2.5 sm:p-3.5 transition-all hover:border-white/20 hover:-translate-y-0.5 group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${tool.color}10`, border: `1px solid ${tool.color}25` }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tool.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[14px] sm:h-[14px]"><path d={tool.icon} /></svg>
                </div>
                <span className="font-mono text-[9px] sm:text-[11px] text-white font-medium truncate">{tool.name}</span>
              </div>
              <p className="text-[8px] sm:text-[10px] text-gray-500 leading-tight">{tool.desc}</p>
            </div>
          ))}
        </div>

        {/* Client compatibility */}
        <div className="bg-[#0E0E11]/90 backdrop-blur-xl border border-white/8 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-3 font-mono text-[9px] sm:text-[10px]">
          <span className="text-gray-500">Works with</span>
          <div className="flex gap-2">
            {["Claude", "Cursor", "Cline"].map((client) => (
              <span key={client} className="text-white/70 bg-white/5 px-1.5 py-0.5 rounded border border-white/8">{client}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowPanel({ className = "" }: { className?: string }) {
  const wrapperRef = useScrollEntrance();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FLOW_DASH_KEYFRAMES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6 ${className}`}>
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative w-full max-w-[360px] mx-auto">
        <div className="relative" style={{ height: "280px" }}>
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
            {/* Trigger → Search */}
            <path d="M 55 140 C 80 140, 80 68, 105 68" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <path d="M 55 140 C 80 140, 80 68, 105 68" fill="none" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="5 12" style={{ animation: "flowDash 1.6s linear infinite" }} />
            {/* Trigger → Publish */}
            <path d="M 55 140 C 80 140, 80 212, 105 212" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <path d="M 55 140 C 80 140, 80 212, 105 212" fill="none" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="5 12" style={{ animation: "flowDash 2s linear infinite" }} />
            {/* Search → Payment */}
            <path d="M 180 68 C 210 68, 210 140, 235 140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <path d="M 180 68 C 210 68, 210 140, 235 140" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="5 12" style={{ animation: "flowDash 1.4s linear infinite" }} />
            {/* Publish → Payment */}
            <path d="M 180 212 C 210 212, 210 140, 235 140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <path d="M 180 212 C 210 212, 210 140, 235 140" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="5 12" style={{ animation: "flowDash 1.8s linear infinite" }} />
            {/* Payment → Done */}
            <path d="M 320 140 L 338 140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            <path d="M 320 140 L 338 140" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 12" style={{ animation: "flowDash 1s linear infinite" }} />
          </svg>

          {/* Trigger */}
          <div className="absolute" style={{ top: "112px", left: "0" }}>
            <N8nNode icon="M13 10V3L4 14h7v7l9-11h-7z" name="Trigger" color="#EC4899" />
          </div>

          {/* Search */}
          <div className="absolute" style={{ top: "34px", left: "105px" }}>
            <N8nNode icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" name="Search" sub="agents" color="#8B5CF6" />
          </div>

          {/* Publish */}
          <div className="absolute" style={{ top: "178px", left: "105px" }}>
            <N8nNode icon="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" name="Publish" sub="registry" color="#3B82F6" />
          </div>

          {/* x402 Payment */}
          <div className="absolute" style={{ top: "100px", left: "235px" }}>
            <N8nNode icon="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" name="x402 Pay" sub="Base L2" color="#F59E0B" wide />
          </div>

          {/* Done */}
          <div className="absolute flex flex-col items-center" style={{ top: "120px", left: "338px" }}>
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.35)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div className="text-[7px] text-gray-500 font-mono mt-1">Done</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function N8nNode({ icon, name, sub, color, wide }: { icon: string; name: string; sub?: string; color: string; wide?: boolean }) {
  return (
    <div className="group relative" style={{ width: wide ? "85px" : "75px" }}>
      <div
        className="rounded-lg border overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
        style={{ background: "rgba(22,22,24,0.92)", borderColor: `${color}20` }}
      >
        <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }} />
        <div className="flex flex-col items-center py-2.5 px-2 gap-1.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: `${color}12`, border: `1px solid ${color}20` }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icon} />
            </svg>
          </div>
          <div className="text-white text-[10px] font-medium leading-none">{name}</div>
          {sub && <div className="text-[8px] leading-none font-mono" style={{ color: `${color}80` }}>{sub}</div>}
        </div>
      </div>
      <div className="absolute top-1/2 -left-[3px] w-[6px] h-[6px] rounded-full" style={{ background: color, transform: "translateY(-50%)", boxShadow: `0 0 4px ${color}50` }} />
      <div className="absolute top-1/2 -right-[3px] w-[6px] h-[6px] rounded-full" style={{ background: color, transform: "translateY(-50%)", boxShadow: `0 0 4px ${color}50` }} />
    </div>
  );
}
