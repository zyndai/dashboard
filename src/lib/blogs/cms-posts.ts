import { prisma } from "@/lib/prisma";
import { BLOG_POSTS, type BlogPostMeta } from "./posts";

function dateLong(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function readTime(text: string | null | undefined): string {
  const words = (text ?? "").split(/\s+/).filter(Boolean).length;
  const min = Math.max(3, Math.ceil(words / 220));
  return `${min} min read`;
}

export interface CmsBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  publishedAt: Date | null;
  status: "draft" | "published";
  tags: string[];
  authorEmail: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
}

/** Returns deduped list (static + published from DB).
 *  Static posts take precedence by slug. */
export async function listAllPosts(): Promise<BlogPostMeta[]> {
  const staticSlugs = new Set(BLOG_POSTS.map((p) => p.slug));

  let cmsPosts: BlogPostMeta[] = [];
  try {
    const rows = await prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 200,
    });

    cmsPosts = rows
      .filter((r) => !staticSlugs.has(r.slug))
      .map((r): BlogPostMeta => ({
        slug: r.slug,
        title: r.title,
        description: r.excerpt ?? "",
        date: r.publishedAt ? dateLong(r.publishedAt) : "",
        iso: r.publishedAt ? r.publishedAt.toISOString().slice(0, 10) : "",
        readTime: readTime(r.body || r.excerpt),
        tags: r.tags ?? [],
      }));
  } catch (err) {
    console.error("[blogs] failed to list CMS posts", err);
  }

  const merged = [...BLOG_POSTS, ...cmsPosts];
  merged.sort((a, b) => (b.iso || "").localeCompare(a.iso || ""));
  return merged;
}

export async function getCmsPost(
  slug: string,
  opts: { includeDrafts?: boolean } = {},
): Promise<CmsBlogPost | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  if (!row) return null;
  if (!opts.includeDrafts && row.status !== "published") return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImage: row.coverImage,
    publishedAt: row.publishedAt,
    status: row.status as "draft" | "published",
    tags: row.tags ?? [],
    authorEmail: row.authorEmail,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    ogImage: row.ogImage,
  };
}
