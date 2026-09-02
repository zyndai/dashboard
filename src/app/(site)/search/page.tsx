import type { Metadata } from "next";
import Link from "next/link";

import { searchAgents } from "@/lib/cards";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Search People — Zynd",
  description:
    "Search Zynd's directory of AI-discoverable people by role, skills, location, industry, and availability.",
  path: "/search",
});

const INPUT =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#5b7cfa]/60 focus:bg-white/[0.06]";

const LABEL = "block text-sm font-medium text-white/60 mb-1.5";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function val(sp: Record<string, string | string[] | undefined>, k: string): string {
  const v = sp[k];
  return typeof v === "string" ? v : "";
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = val(sp, "q");
  const role = val(sp, "role");
  const location = val(sp, "location");
  const skills = val(sp, "skills");
  const industry = val(sp, "industry");
  const availability = val(sp, "availability");
  const experience_min = val(sp, "experience_min");

  const hasQuery = Boolean(
    q || role || location || skills || industry || availability || experience_min,
  );
  const data = hasQuery
    ? await searchAgents({ q, role, location, skills, industry, availability, experience_min })
    : null;

  return (
    <>
      <article className="text-white selection:bg-[#5b7cfa]/30 antialiased font-sans pb-32">
        <div className="mx-auto w-full max-w-[1000px] px-6 pt-12">
          <header className="mb-10">
            {/* div not h1 — globals.css sets h1 { font-size: 6rem } */}
            <div className="text-4xl font-bold text-white md:text-5xl">
              Find people on Zynd
            </div>
            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
              Search Zynd&apos;s directory of AI-discoverable people by role,
              skills, location, industry, and availability.
            </p>
          </header>

          <form
            method="get"
            action="/search"
            className="mb-12 flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div>
              <label className={LABEL} htmlFor="q">
                Search
              </label>
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Search — e.g. GTM engineer, rust developer…"
                className={INPUT}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  defaultValue={location}
                  placeholder="e.g. Bangalore"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="skills">
                  Skills
                </label>
                <input
                  id="skills"
                  name="skills"
                  defaultValue={skills}
                  placeholder="Comma-separated — rust, solidity"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="availability">
                  Availability
                </label>
                <input
                  id="availability"
                  name="availability"
                  defaultValue={availability}
                  placeholder="fulltime / contract / freelance / open"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="experience_min">
                  Min years experience
                </label>
                <input
                  id="experience_min"
                  name="experience_min"
                  type="number"
                  defaultValue={experience_min}
                  placeholder="e.g. 3"
                  className={INPUT}
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5b7cfa] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4a67e0]"
            >
              Search
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
              </svg>
            </button>
          </form>

          {hasQuery && (
            <section aria-label="Search results">
              <div className="mb-4 flex items-baseline justify-between">
                <div className="text-lg font-bold text-white">
                  Results{data ? ` (${data.results.length})` : ""}
                </div>
                {data && data.results.length > 0 && (
                  <div className="text-sm text-zinc-500">Best matches first</div>
                )}
              </div>

              {data && data.results.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.results.map((r) => (
                    <Link
                      key={r.agent_id}
                      href={r.handle ? `/p/${r.handle}` : `/profile/${r.agent_id}`}
                      className="group flex flex-col rounded-lg border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-[#5b7cfa]/40"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-white group-hover:text-[#a5b4fc]">
                            {r.name}
                          </div>
                          {r.headline && (
                            <div className="mt-0.5 text-sm text-zinc-400 line-clamp-2">
                              {r.headline}
                            </div>
                          )}
                          {r.location && (
                            <div className="mt-1 text-xs text-zinc-500">{r.location}</div>
                          )}
                        </div>
                        {r.match_score > 0 && (
                          <span className="flex-shrink-0 rounded-full border border-[#5b7cfa]/30 bg-[#5b7cfa]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#a5b4fc]">
                            {Math.round(r.match_score * 100)}%
                          </span>
                        )}
                      </div>

                      {r.skills.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {r.skills.slice(0, 5).map((s) => (
                            <span
                              key={s}
                              className="inline-flex rounded-full border border-[#5b7cfa]/30 bg-[#5b7cfa]/10 px-2.5 py-0.5 text-xs text-[#a5b4fc]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {(r.experience_years != null || r.availability) && (
                        <div className="mb-3 text-xs text-zinc-500">
                          {r.experience_years != null && `${r.experience_years} years experience`}
                          {r.experience_years != null && r.availability && " · "}
                          {r.availability && `Available for ${r.availability}`}
                        </div>
                      )}

                      {r.match_reasons.length > 0 && (
                        <div className="mt-auto text-xs text-zinc-500">
                          <span className="text-zinc-600">Why: </span>
                          <span className="text-zinc-400">
                            {r.match_reasons.join(" · ")}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : data && data.results.length === 0 ? (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-8 text-zinc-400">
                  No matches found. Try a broader query, or{" "}
                  <Link href="/create" className="text-[#5b7cfa] hover:text-white">
                    create your profile
                  </Link>
                  .
                </div>
              ) : null}
            </section>
          )}
        </div>
      </article>
    </>
  );
}
