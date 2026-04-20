export const COLOR_MAP: Record<string, string> = {
  AI: "#5b7cfa", Data: "#10b981", Extraction: "#10b981",
  Analysis: "#f59e0b", Scoring: "#f59e0b", Orchestration: "#c084fc",
  Verification: "#ec4899", Parsing: "#06b6d4", NLP: "#06b6d4",
  "Fair Hiring": "#14b8a6", "Bias Detection": "#14b8a6", Automation: "#f43f5e",
  Integration: "#8b5cf6", Search: "#3b82f6", Security: "#ef4444",
  Communication: "#8b5cf6", Finance: "#10b981", "Developer Tools": "#c084fc",
  Discovery: "#06b6d4", Payments: "#10b981", Identity: "#3b82f6",
  scraping: "#10b981", "data-extraction": "#f59e0b",
  search: "#3b82f6", language: "#06b6d4",
  weather: "#f59e0b", finance: "#10b981",
  assistant: "#8b5cf6", persona: "#c084fc",
  code: "#5b7cfa", utilities: "#94a3b8",
  blockchain: "#f59e0b", knowledge: "#06b6d4",
  location: "#10b981", news: "#ef4444",
};

export function getCategoryColor(category: string | null | undefined): string {
  if (!category) return "#5b7cfa";
  return COLOR_MAP[category] || "#5b7cfa";
}
