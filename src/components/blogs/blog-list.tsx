"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { BLOG_POSTS, type BlogPostMeta } from "@/lib/blogs/posts";

const ALL_TAGS = (() => {
  const set = new Set<string>();
  for (const p of BLOG_POSTS) for (const t of p.tags) set.add(t);
  return Array.from(set);
})();

function PostCard({ post, large = false }: { post: BlogPostMeta; large?: boolean }): React.ReactElement {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className={`group relative flex flex-col rounded-xl border border-white/[0.08] bg-[#0A0E17] transition-colors duration-200 hover:border-white/20 ${
        large ? "p-7 md:p-9" : "p-6"
      }`}
    >
      <div className="flex items-start justify-between mb-5 gap-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded border border-[#5b7cfa]/25 bg-[#5b7cfa]/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#a5b4fc] leading-none"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#5b7cfa] transition-transform duration-200 group-hover:translate-x-1 leading-none flex-shrink-0">
          Read
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>

      <div
        role="heading"
        aria-level={2}
        className={`font-bold tracking-tight text-white leading-snug transition-colors group-hover:text-[#a5b4fc] ${
          large ? "text-[26px] md:text-[30px] mb-4" : "text-[18px] mb-3"
        }`}
        style={{ letterSpacing: "-0.01em", lineHeight: 1.25 }}
      >
        {post.title}
      </div>

      <p
        className={`text-zinc-400 flex-1 ${
          large ? "text-[15px] mb-7 line-clamp-4" : "text-[13.5px] mb-6 line-clamp-3"
        }`}
        style={{ lineHeight: 1.6, letterSpacing: 0 }}
      >
        {post.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-white/[0.08] pt-4 text-[12px] font-medium text-zinc-500 leading-none">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" /> {post.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" /> {post.readTime}
        </span>
      </div>
    </Link>
  );
}

export default function BlogList(): React.ReactElement {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const visible = useMemo(
    () => (activeTag ? BLOG_POSTS.filter((p) => p.tags.includes(activeTag)) : BLOG_POSTS),
    [activeTag],
  );

  const featured = activeTag ? null : visible.find((p) => p.featured) ?? null;
  const rest = featured ? visible.filter((p) => p.slug !== featured.slug) : visible;

  return (
    <section
      className="text-white selection:bg-[#5b7cfa]/30 antialiased font-sans"
      style={{
        background: "transparent",
        letterSpacing: "normal",
        lineHeight: 1.5,
        marginTop: "-3rem",
        paddingTop: "1rem",
      }}
    >
      <div className="mx-auto w-full max-w-[1240px] px-[60px] max-[991px]:px-10 max-[767px]:px-6 pb-24">
        <header className="mb-12 max-w-3xl">
          <div
            role="heading"
            aria-level={1}
            className="font-bold text-white mb-5"
            style={{
              fontSize: "clamp(36px, 5vw, 52px)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              textAlign: "left",
            }}
          >
            Notes from the agent network.
          </div>

          <p
            className="text-zinc-400 max-w-2xl text-[16px]"
            style={{ lineHeight: 1.6, letterSpacing: 0 }}
          >
            Protocol deep-dives, infrastructure decisions, and field reports from the
            team building the trust and payment layer for AI agents.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium font-mono leading-none border transition-colors ${
                activeTag === null
                  ? "border-[#5b7cfa]/50 bg-[#5b7cfa]/10 text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20"
              }`}
              style={{ letterSpacing: "0.02em" }}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => {
              const active = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(active ? null : tag)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium font-mono leading-none border transition-colors ${
                    active
                      ? "border-[#5b7cfa]/50 bg-[#5b7cfa]/10 text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                  style={{ letterSpacing: "0.02em" }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </header>

        {featured && (
          <div className="mb-8">
            <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-3 leading-none">
              Featured
            </div>
            <PostCard post={featured} large />
          </div>
        )}

        {rest.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.08] bg-[#0A0E17] py-14 text-center text-sm text-zinc-500 font-mono">
            No posts under {activeTag} yet.
          </div>
        )}
      </div>
    </section>
  );
}
