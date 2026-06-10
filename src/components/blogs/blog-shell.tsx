import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blogs/posts";

interface BlogShellProps {
  post: BlogPostMeta;
  children: React.ReactNode;
}

export default function BlogShell({ post, children }: BlogShellProps): React.ReactElement {
  return (
    <article
      className="text-white selection:bg-[#5b7cfa]/30 antialiased font-sans pb-32"
      style={{
        background: "transparent",
        letterSpacing: "normal",
        lineHeight: 1.5,
        marginTop: "-3rem",
        paddingTop: "1rem",
      }}
    >
      <div className="mx-auto pt-6 w-full max-w-[720px] px-6">
        <Link
          href="/blogs"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-[#5b7cfa] mb-12 leading-none"
          style={{ letterSpacing: 0 }}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Link>

        <header className="mb-14 pb-10 border-b border-white/[0.08]">
          <div className="flex flex-wrap gap-2 mb-7">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-md border border-[#5b7cfa]/30 bg-[#5b7cfa]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#5b7cfa] leading-none"
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            role="heading"
            aria-level={1}
            className="font-bold text-white mb-6"
            style={{
              fontSize: "clamp(32px, 4.5vw, 44px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              textAlign: "left",
            }}
          >
            {post.title}
          </div>

          <p
            className="text-zinc-400 mb-8 text-[18px] md:text-[20px]"
            style={{ lineHeight: 1.55, letterSpacing: 0 }}
          >
            {post.description}
          </p>

          <div className="flex items-center gap-6 text-[14px] font-medium text-zinc-500 mt-8 pt-6 border-t border-white/[0.04] leading-none">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </header>

        <div
          className="
            [&_p]:!text-zinc-300 [&_p]:!text-[18px] [&_p]:!leading-[1.75] [&_p]:!mb-7 [&_p]:!tracking-normal [&_p]:!text-left
            [&_h2]:!text-[28px] [&_h2]:!font-bold [&_h2]:!text-white [&_h2]:!leading-[1.25] [&_h2]:!mt-14 [&_h2]:!mb-5 [&_h2]:!tracking-tight [&_h2]:!text-left [&_h2]:!bg-none [&_h2]:[-webkit-text-fill-color:white]
            [&_h3]:!text-[21px] [&_h3]:!font-bold [&_h3]:!text-white [&_h3]:!leading-[1.3] [&_h3]:!mt-10 [&_h3]:!mb-4 [&_h3]:!tracking-tight [&_h3]:!text-left [&_h3]:!bg-none [&_h3]:[-webkit-text-fill-color:white]
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-7 [&_ul]:space-y-2 [&_ul]:text-[17px] [&_ul]:text-zinc-300 [&_ul]:leading-[1.75]
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-7 [&_ol]:space-y-2 [&_ol]:text-[17px] [&_ol]:text-zinc-300 [&_ol]:leading-[1.75]
            [&_li]:!tracking-normal
            [&_li::marker]:text-[#5b7cfa]
            [&_a]:!text-[#5b7cfa] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[#5b7cfa]/30 hover:[&_a]:!text-white hover:[&_a]:decoration-white/50 [&_a]:transition-colors
            [&_strong]:text-white [&_strong]:font-semibold
            [&_blockquote]:border-l-2 [&_blockquote]:border-[#5b7cfa] [&_blockquote]:bg-[#5b7cfa]/[0.03] [&_blockquote]:py-4 [&_blockquote]:px-5 [&_blockquote]:my-8 [&_blockquote]:text-zinc-400 [&_blockquote]:italic [&_blockquote]:rounded-r-md [&_blockquote>p]:!mb-0
            [&_code]:bg-[#0A0E17] [&_code]:border [&_code]:border-white/[0.1] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[14.5px] [&_code]:text-[#a5b4fc] [&_code]:font-mono
            [&_pre]:bg-[#0A0E17] [&_pre]:border [&_pre]:border-white/[0.1] [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:my-7 [&_pre]:overflow-x-auto [&_pre]:text-[13.5px] [&_pre]:leading-[1.7]
            [&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0 [&_pre_code]:text-zinc-300
          "
          style={{ letterSpacing: "normal" }}
        >
          {children}
        </div>
      </div>
    </article>
  );
}
