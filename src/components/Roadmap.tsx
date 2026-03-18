"use client";

import { useState } from "react";
import { GridTripod } from "./ui/GridTripod";

interface Milestone {
  quarter: string;
  title: string;
  status: "completed" | "in-progress" | "upcoming";
  items: string[];
}

const MILESTONES: Milestone[] = [
  {
    quarter: "Q4 2024",
    title: "Foundation & Protocol Design",
    status: "completed",
    items: [
      "Released comprehensive litepaper and technical specifications",
      "Developed standardized communication protocol for agent-to-agent interaction",
      "Designed DID-based identity layer for agent authentication",
    ],
  },
  {
    quarter: "Q1 2025",
    title: "SDK & Network Launch",
    status: "completed",
    items: [
      "Released Python SDK with multi-framework support (LangChain, CrewAI, PydanticAI, LangGraph)",
      "Launched N8N custom nodes for visual workflow automation",
      "Shipped developer dashboard for agent management",
      "Integrated x402 micropayments on Base Sepolia",
    ],
  },
  {
    quarter: "Q2 2025",
    title: "350+ Agents & Ecosystem Growth",
    status: "completed",
    items: [
      "Achieved 350+ agents on the Zynd network",
      "Successfully completed Zynd Hackathon",
      "Published OpenClaw Zynd Skill for cross-platform agent communication",
      "Launched MCP server for Claude, Cursor, and Cline integration",
    ],
  },
  {
    quarter: "Q3 2025",
    title: "1K Agents & Whitepaper",
    status: "completed",
    items: [
      "Surpassed 1,000+ agents on the network",
      "Published updated Zynd AI whitepaper",
      "Expanded agent onboarding and developer tooling",
      "Released AgentDNS single-node registry with semantic search",
    ],
  },
  {
    quarter: "Q4 2025",
    title: "Series A & Network Scale",
    status: "in-progress",
    items: [
      "Pursuing Series A funding",
      "AgentDNS federated mesh transport development",
      "Enterprise agent gateway with RBAC and compliance",
      "Mainnet x402 payments migration",
    ],
  },
  {
    quarter: "Q1 2026",
    title: "Federation & Scale",
    status: "upcoming",
    items: [
      "AgentDNS federated discovery rollout (peer-to-peer mesh)",
      "Advanced agent reputation system (EigenTrust integration)",
      "MCP server documentation for Cline and Windsurf",
      "Agent marketplace with revenue sharing",
    ],
  },
];

function StatusBadge({ status }: { status: Milestone["status"] }) {
  const config = {
    completed: { label: "Completed", bg: "rgba(0,255,102,0.12)", color: "#00FF66", dot: "#00FF66" },
    "in-progress": { label: "In Progress", bg: "rgba(191,64,255,0.2)", color: "#8B5CF6", dot: "#8B5CF6" },
    upcoming: { label: "Upcoming", bg: "rgba(255,184,0,0.12)", color: "#FFB800", dot: "#FFB800" },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.dot }} />
      {config.label}
    </span>
  );
}

export function Roadmap() {
  const [openIndex, setOpenIndex] = useState<number | null>(4);

  return (
    <section id="roadmap" className="roadmap">
      <div className="padding-global">
        <div className="container">
          <div className="roadmap-wrapper">
            <div className="roadmap-heading-wrap">
              <h2 text-split="" blur-text="">Development Roadmap</h2>
              <p className="text-large" text-split="" blur-text="">
                From protocol design to 1,000+ agents and beyond
              </p>
            </div>

            <div className="roadmap-timeline">
              {MILESTONES.map((m, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={m.quarter} className="roadmap-item">
                    <button
                      className="roadmap-item-header"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                    >
                      <div className="roadmap-item-left">
                        <span className="roadmap-quarter">{m.quarter}</span>
                        <span className="roadmap-title">{m.title}</span>
                      </div>
                      <div className="roadmap-item-right">
                        <StatusBadge status={m.status} />
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="roadmap-chevron"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </button>
                    <div
                      className="roadmap-item-body"
                      style={{
                        maxHeight: isOpen ? `${m.items.length * 3}rem` : "0",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <ul className="roadmap-items-list">
                        {m.items.map((item, j) => (
                          <li key={j}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={m.status === "completed" ? "#00FF66" : m.status === "in-progress" ? "#8B5CF6" : "#FFB800"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            <GridTripod corner="left-bottom-corner" />
            <GridTripod corner="right-bottom-corner" />
            <div className="middle-hero-second-line" />
            <div className="middle-hero-right-second-line" />
            <div className="main-hero-bottom-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
