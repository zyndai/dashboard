export const COLOR_MAP: Record<string, string> = {
  AI: "#5b7cfa", Data: "#10b981", Extraction: "#10b981",
  Analysis: "#f59e0b", Scoring: "#f59e0b", Orchestration: "#c084fc",
  Verification: "#ec4899", Parsing: "#06b6d4", NLP: "#06b6d4",
  "Fair Hiring": "#14b8a6", "Bias Detection": "#14b8a6", Automation: "#f43f5e",
  Integration: "#8b5cf6", Search: "#3b82f6", Security: "#ef4444",
  Communication: "#8b5cf6", Finance: "#10b981", "Developer Tools": "#c084fc",
  Discovery: "#06b6d4", Payments: "#10b981", Identity: "#3b82f6",

  General: "#94a3b8", "Supply Chain": "#f59e0b", Ecommerce: "#ec4899",
  Devops: "#22d3ee", DevOps: "#22d3ee", "Hr Recruiting": "#14b8a6",
  "HR Recruiting": "#14b8a6", "Real Estate": "#84cc16",
  Marketing: "#f43f5e", Sales: "#f97316", Legal: "#a78bfa",
  Healthcare: "#06b6d4", Education: "#fbbf24", Productivity: "#8b5cf6",
  Logistics: "#f59e0b", Travel: "#0ea5e9", Gaming: "#a855f7",

  scraping: "#10b981", "data-extraction": "#f59e0b",
  search: "#3b82f6", language: "#06b6d4",
  weather: "#f59e0b", finance: "#10b981",
  assistant: "#8b5cf6", persona: "#c084fc",
  code: "#5b7cfa", utilities: "#94a3b8",
  blockchain: "#f59e0b", knowledge: "#06b6d4",
  location: "#10b981", news: "#ef4444",
};

const PALETTE: string[] = [
  "#6366f1", // indigo
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
  "#84cc16", // lime
  "#0ea5e9", // sky
  "#f97316", // orange
  "#a78bfa", // violet
  "#22d3ee", // light cyan
  "#fbbf24", // gold
];

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getCategoryColor(category: string | null | undefined): string {
  if (!category) return PALETTE[0];
  const direct = COLOR_MAP[category];
  if (direct) return direct;
  const lower = COLOR_MAP[category.toLowerCase()];
  if (lower) return lower;
  const dashed = COLOR_MAP[category.toLowerCase().replace(/\s+/g, "-")];
  if (dashed) return dashed;
  return PALETTE[hashStr(category.toLowerCase()) % PALETTE.length];
}
