import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Navbar } from "@/components/Navbar";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

async function fetchPost(slug: string, isPreview: boolean) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "blog-posts",
    where: { slug: { equals: slug } },
    limit: 1,
    draft: isPreview,
    overrideAccess: isPreview,
  });
  return result.docs[0] ?? null;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const post = await fetchPost(slug, sp.preview === "true");
  if (!post) return {};
  const seo = (post.seo ?? {}) as { title?: string; description?: string };
  return pageMetadata({
    title: seo.title || (post.title as string),
    description: seo.description || (post.excerpt as string) || "",
    path: `/blogs/${slug}`,
    type: "article",
  });
}

export default async function CmsPostPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "true";

  const post = await fetchPost(slug, isPreview);
  if (!post) notFound();

  const tags = Array.isArray(post.tags)
    ? (post.tags as Array<{ tag?: string }>).map((t) => t.tag).filter(Boolean)
    : [];
  const publishedAt = post.publishedAt
    ? new Date(post.publishedAt as string).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Navbar />
      <article
        className="text-white selection:bg-[#5b7cfa]/30 antialiased font-sans pb-32"
        style={{ letterSpacing: "normal", lineHeight: 1.5, marginTop: "-3rem", paddingTop: "1rem" }}
      >
        <div className="mx-auto pt-6 w-full max-w-[720px] px-6">
          {isPreview && (
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-md border border-[#5b7cfa]/30 bg-[#5b7cfa]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#5b7cfa]">
                Draft preview
              </span>
              <a
                href={`/admin/collections/blog-posts?where[slug][equals]=${encodeURIComponent(slug)}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
              >
                ← Back to editor
              </a>
            </div>
          )}

          <header className="mb-14 pb-10 border-b border-white/[0.08]">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-7">
                {tags.map((tag) => (
                  <span
                    key={tag as string}
                    className="inline-flex rounded-md border border-[#5b7cfa]/30 bg-[#5b7cfa]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#5b7cfa] leading-none"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Use a `div` with role="heading" to bypass globals.css's
                `h1, h2 { text-transform: uppercase !important }`. The global rule
                exists for the marketing pages and we don't want it on prose. */}
            <div
              role="heading"
              aria-level={1}
              className="font-bold text-white mb-6"
              style={{
                fontSize: "clamp(32px, 4.5vw, 44px)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                textTransform: "none",
              }}
            >
              {post.title as string}
            </div>

            {post.excerpt ? (
              <p className="text-zinc-400 mb-8 text-[18px] md:text-[20px]" style={{ lineHeight: 1.55 }}>
                {post.excerpt as string}
              </p>
            ) : null}

            {publishedAt && (
              <div className="flex items-center gap-6 text-[14px] font-medium text-zinc-500 mt-8 pt-6 border-t border-white/[0.04] leading-none">
                <span>{publishedAt}</span>
              </div>
            )}
          </header>

          <div
            className="
              [&_p]:!text-zinc-300 [&_p]:!text-[18px] [&_p]:!leading-[1.75] [&_p]:!mb-7 [&_p]:!tracking-normal [&_p]:!text-left [&_p]:[text-transform:none]
              [&_h1]:![text-transform:none] [&_h1]:!font-sans [&_h1]:!text-[34px] [&_h1]:!font-bold [&_h1]:!text-white [&_h1]:!leading-[1.2] [&_h1]:!mt-14 [&_h1]:!mb-6 [&_h1]:!tracking-tight [&_h1]:!text-left
              [&_h2]:![text-transform:none] [&_h2]:!font-sans [&_h2]:!text-[28px] [&_h2]:!font-bold [&_h2]:!text-white [&_h2]:!leading-[1.25] [&_h2]:!mt-14 [&_h2]:!mb-5 [&_h2]:!tracking-tight [&_h2]:!text-left
              [&_h3]:![text-transform:none] [&_h3]:!font-sans [&_h3]:!text-[21px] [&_h3]:!font-bold [&_h3]:!text-white [&_h3]:!leading-[1.3] [&_h3]:!mt-10 [&_h3]:!mb-4 [&_h3]:!tracking-tight [&_h3]:!text-left
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-7 [&_ul]:space-y-2 [&_ul]:text-[17px] [&_ul]:text-zinc-300 [&_ul]:leading-[1.75]
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-7 [&_ol]:space-y-2 [&_ol]:text-[17px] [&_ol]:text-zinc-300 [&_ol]:leading-[1.75]
              [&_li]:!tracking-normal
              [&_li::marker]:text-[#5b7cfa]
              [&_a]:!text-[#5b7cfa] [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:!text-white
              [&_strong]:text-white [&_strong]:font-semibold
              [&_blockquote]:border-l-2 [&_blockquote]:border-[#5b7cfa] [&_blockquote]:bg-[#5b7cfa]/[0.03] [&_blockquote]:py-4 [&_blockquote]:px-5 [&_blockquote]:my-8 [&_blockquote]:text-zinc-400 [&_blockquote]:italic [&_blockquote]:rounded-r-md
              [&_code]:bg-[#0A0E17] [&_code]:border [&_code]:border-white/[0.1] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[14.5px] [&_code]:text-[#a5b4fc]
              [&_pre]:bg-[#0A0E17] [&_pre]:border [&_pre]:border-white/[0.1] [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:my-7 [&_pre]:overflow-x-auto
              [&_img]:rounded-lg [&_img]:my-8
            "
          >
            <RichText data={post.body as Parameters<typeof RichText>[0]["data"]} />
          </div>
        </div>
      </article>
    </>
  );
}
