import type { Metadata } from "next";
import "./agent-card.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zynd.ai"),
  title: "Zynd — The Living Professional Identity for Technical Builders and Agents",
  description:
    "Zynd synthesizes GitHub, LinkedIn, X and your website into one living professional profile — browsable by people, searchable by AI agents.",
  alternates: { canonical: "/agent-card" },
};

export default function AgentCardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="ac-page antialiased selection:bg-[#4f46e5] selection:text-white overflow-x-hidden min-h-screen max-w-[100vw]">
        <div className="ac-mesh" aria-hidden="true">
          <span className="ac-blob ac-blob-a" />
          <span className="ac-blob ac-blob-b" />
          <span className="ac-blob ac-blob-c" />
        </div>
        <div className="ac-grain" aria-hidden="true" />
        <div className="relative z-[2]">{children}</div>
      </body>
    </html>
  );
}
