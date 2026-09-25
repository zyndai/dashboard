import { claimHeaders, forgetClaimToken } from "./claim-tokens";

export interface Identity {
  name: string;
  headline: string;
  location: string;
  avatar_url: string;
  avatar_bg_url?: string;
  links: Record<string, string>;
}

export interface Skill {
  name: string;
  level: string;
  evidence_count: number;
}

export interface Project {
  name: string;
  description: string;
  url: string;
  source: string;
  stars?: number | null;
  tech?: string[] | null;
}

export interface WritingSample {
  platform: string;
  excerpt: string;
  url: string;
  posted_at: string;
  metrics?: string[] | null;
}

export interface Source {
  platform: string;
  url: string | null;
  scraped_at: string;
  method: string;
}

export interface Review {
  status: string;
  reviewed_by: string;
  reviewed_at: string;
}

export interface LinkedInStats {
  connections: number | string;
  posts: number | string;
  verified?: boolean;
  avatar?: string;
}

export interface XStats {
  handle: string;
  followers: number | string;
  posts: number | string;
  impressions: number | string;
  avatar?: string;
}

/** `levels` holds one 0–4 intensity per day, oldest first (GitHub-style heatmap). */
export interface ContributionStats {
  year: number;
  total: number;
  avg_per_day: number;
  levels: number[];
}

export interface Endorsement {
  quote: string;
  reviewer_count: number;
}

export interface AgentProfileCard {
  id: string;
  schema_version: string;
  status: string;
  handle: string;
  created_at: string;
  updated_at: string;
  identity: Identity;
  citation_snippet: string;
  summary: string;
  skills: Skill[];
  projects: Project[];
  writing_samples: WritingSample[];
  searchable_facts: string[];
  sources: Source[];
  review: Review;
  experience_years: number | null;
  industries: string[];
  availability: string;
  working_on: string[];
  can_help_with: string[];
  connect_with: string[];
  love_talking_about: string[];
  github_stats: {
    total_repos: number;
    active_repos: number;
    top_languages: string[];
    total_commits?: number | string | null;
    loc_added?: number | string | null;
    followers?: number | string | null;
  } | null;

  affiliations?: string | null;
  /** 0–100 synthesis confidence shown on the About card. */
  synthesis_score?: number | null;
  linkedin_stats?: LinkedInStats | null;
  x_stats?: XStats | null;
  contribution_stats?: ContributionStats | null;
  endorsement?: Endorsement | null;
  calendly_url?: string | null;
  /** Structured LinkedIn work history extracted at scrape time. */
  work_experience?: Array<{
    title: string;
    company: string;
    company_logo?: string;
    employment_type?: string;
    start_date?: string;
    end_date?: string;
    duration?: string;
    location?: string;
    description?: string;
  }> | null;
  /** Public findability facts from the ZYND memory layer, stored by the backend cron. */
  zynd_memory?: Array<Record<string, unknown>> | null;
}

export interface AgentSearchResult {
  agent_id: string;
  handle: string;
  name: string;
  headline: string;
  location: string;
  skills: string[];
  industries: string[];
  availability: string;
  experience_years: number | null;
  match_score: number;
  match_reasons: string[];
  url: string;
}

export interface AgentSearchResponse {
  query: Record<string, string | number | null>;
  searchable_attributes: { name: string; type: string; description: string }[];
  results: AgentSearchResult[];
}

export interface ScrapeWarning {
  url: string;
  message: string;
}

export interface OnboardStatus {
  status: "running" | "ready" | "error";
  card: AgentProfileCard | null;
  error: string | null;
  url_warnings: ScrapeWarning[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.zynd.ai";

export async function fetchCard(id: string): Promise<AgentProfileCard | null> {
  try {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as AgentProfileCard;
  } catch {
    return null;
  }
}

export async function fetchCardByHandle(handle: string): Promise<AgentProfileCard | null> {
  try {
    const res = await fetch(`${API_BASE}/cards/by-handle/${handle}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as AgentProfileCard;
  } catch {
    return null;
  }
}

export async function listCards(): Promise<AgentProfileCard[]> {
  try {
    const res = await fetch(`${API_BASE}/cards`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as AgentProfileCard[]) : [];
  } catch {
    return [];
  }
}

export function cardCanonicalUrl(card: AgentProfileCard): string {
  const base = "https://www.zynd.ai";
  return card.handle ? `${base}/p/${card.handle}` : `${base}/profile/${card.id}`;
}

export async function searchAgents(
  params: Record<string, string>,
): Promise<AgentSearchResponse> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) qs.set(k, v);
  }
  try {
    const res = await fetch(`${API_BASE}/v1/agents/search?${qs}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { query: {}, searchable_attributes: [], results: [] };
    return (await res.json()) as AgentSearchResponse;
  } catch {
    return { query: {}, searchable_attributes: [], results: [] };
  }
}

export async function getMyCard(
  token: string,
): Promise<{ card: AgentProfileCard; handle: string } | null> {
  const lookup = await lookupMyCardHandle(token);
  if (lookup.failed || !lookup.handle || !lookup.card) return null;
  return { card: lookup.card, handle: lookup.handle };
}

export async function lookupMyCardHandle(
  token: string,
): Promise<{ handle: string | null; card: AgentProfileCard | null; failed: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/cards/mine`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.status === 401 || res.status >= 500) {
      return { handle: null, card: null, failed: true };
    }
    if (!res.ok) return { handle: null, card: null, failed: false };
    const data = (await res.json()) as { card?: AgentProfileCard; handle?: string } | null;
    const handle = data?.handle ?? null;
    return { handle, card: data?.card ?? null, failed: false };
  } catch {
    return { handle: null, card: null, failed: true };
  }
}

export async function updateCard(
  handle: string,
  card: AgentProfileCard,
  token: string,
): Promise<AgentProfileCard | null> {
  try {
    const res = await fetch(`${API_BASE}/cards/by-handle/${encodeURIComponent(handle)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...claimHeaders(handle),
      },
      body: JSON.stringify(card),
    });
    if (!res.ok) return null;
    forgetClaimToken(handle);
    return (await res.json()) as AgentProfileCard;
  } catch {
    return null;
  }
}

async function readApiError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown };
    if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail.map(String).join("; ");
    }
  } catch {
    // body was not JSON
  }
  return res.statusText || `Request failed (${res.status})`;
}

export function githubLoginFromUrl(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (!/(^|\.)github\.com$/i.test(hostname)) return null;
    const [user] = pathname.split("/").filter(Boolean);
    if (!user || ["orgs", "settings", "login", "signup"].includes(user.toLowerCase())) return null;
    return user;
  } catch {
    return null;
  }
}

export async function refreshCardLinkedIn(
  handle: string,
  token: string,
  linkedinUrl: string,
): Promise<{ work_experience: AgentProfileCard["work_experience"] }> {
  const res = await fetch(
    `${API_BASE}/cards/by-handle/${encodeURIComponent(handle)}/refresh-linkedin`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ linkedin_url: linkedinUrl }),
    },
  );
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as { work_experience: AgentProfileCard["work_experience"] };
}

export async function refreshCardGithub(
  handle: string,
  token: string,
  githubHandle: string,
): Promise<{
  github_stats: AgentProfileCard["github_stats"];
  contribution_stats: AgentProfileCard["contribution_stats"];
}> {
  const res = await fetch(
    `${API_BASE}/cards/by-handle/${encodeURIComponent(handle)}/refresh-github`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ github_handle: githubHandle }),
    },
  );
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as {
    github_stats: AgentProfileCard["github_stats"];
    contribution_stats: AgentProfileCard["contribution_stats"];
  };
}

export { API_BASE as CARDS_API };

export interface GithubExtras {
  followers: number | null;
  following: number | null;
  bio: string | null;
  contributions: ContributionStats | null;
}

export async function fetchGithubExtras(login: string): Promise<GithubExtras> {
  const empty: GithubExtras = { followers: null, following: null, bio: null, contributions: null };
  if (!login || !/^[A-Za-z0-9-]{1,39}$/.test(login)) return empty;

  const headers = { Accept: "application/json", "User-Agent": "zynd-dashboard" };
  const opts = { headers, next: { revalidate: 3600 } } as const;

  const userP = fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, opts)
    .then(async (res) => (res.ok ? res.json() : null))
    .catch(() => null);
  const contribP = fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(login)}?y=last`,
    opts,
  )
    .then(async (res) => (res.ok ? res.json() : null))
    .catch(() => null);

  const [user, contrib] = await Promise.all([userP, contribP]);

  let contributions: ContributionStats | null = null;
  const days = contrib?.contributions;
  if (Array.isArray(days) && days.length > 0) {
    const totalRaw = contrib?.total;
    const total =
      typeof totalRaw === "number"
        ? totalRaw
        : typeof totalRaw?.lastYear === "number"
          ? totalRaw.lastYear
          : days.reduce((n: number, d: { count?: number }) => n + (d.count ?? 0), 0);
    contributions = {
      year: new Date().getFullYear(),
      total,
      avg_per_day: days.length ? Math.round((total / days.length) * 10) / 10 : 0,
      levels: days.map((d: { level?: number }) => {
        const lvl = Number(d.level ?? 0);
        return Number.isFinite(lvl) ? Math.min(4, Math.max(0, lvl)) : 0;
      }),
    };
  }

  return {
    followers: typeof user?.followers === "number" ? user.followers : null,
    following: typeof user?.following === "number" ? user.following : null,
    bio: typeof user?.bio === "string" && user.bio.trim() ? user.bio.trim() : null,
    contributions,
  };
}
