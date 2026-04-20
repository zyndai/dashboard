"use client";

const LOGOS = [
  { name: "LangChain", file: "langchain.svg" },
  { name: "CrewAI", file: "crewai.svg" },
  { name: "n8n", file: "n8n.svg" },
  { name: "Claude", file: "anthropic.svg" },
  { name: "ChatGPT", file: "openai.svg" },
  { name: "LangGraph", file: "langgraph.svg" },
  { name: "PydanticAI", file: "pydantic.svg" },
  { name: "Base", file: "base.svg" },
];

function LogoSet(): React.ReactElement {
  return (
    <>
      {LOGOS.map((l) => (
        <span key={l.name} className="zynd-logo-item">
          <img
            src={`/assets/logos/${l.file}`}
            alt={l.name}
            className="zynd-logo-img"
          />
          {l.name}
        </span>
      ))}
    </>
  );
}

export function LogoStrip(): React.ReactElement {
  return (
    <div className="zynd-logo-strip">
      <div className="zynd-logo-label">Built for the modern AI stack:</div>
      <div className="zynd-marquee-wrap">
        <div className="zynd-marquee-track">
          <LogoSet />
          <LogoSet />
        </div>
      </div>
    </div>
  );
}
