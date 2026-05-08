import { getPayload } from "payload";
import config from "@payload-config";
import { BLOG_POSTS, type BlogPostMeta } from "./posts";

function dateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function readTimeFromExcerpt(excerpt: string | null | undefined): string {
  // Best-effort estimate when we don't have the full body word count.
  // Most CMS posts will land at 5–10 minutes once content fills in.
  const words = (excerpt ?? "").split(/\s+/).filter(Boolean).length;
  const min = Math.max(3, Math.ceil(words / 40));
  return `${min} min read`;
}

/** Returns the deduped list of blog posts (static + published in Payload).
 *  Static posts take precedence — they have rich JSX bodies that the CMS
 *  scaffolds don't yet contain. CMS posts only show up if their slug is not
 *  already in the static set. */
export async function listAllPosts(): Promise<BlogPostMeta[]> {
  const staticSlugs = new Set(BLOG_POSTS.map((p) => p.slug));

  let cmsPosts: BlogPostMeta[] = [];
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blog-posts",
      where: { status: { equals: "published" } },
      limit: 200,
      sort: "-publishedAt",
    });

    cmsPosts = result.docs
      .filter((d) => {
        const slug = d.slug as string | undefined;
        return slug && !staticSlugs.has(slug);
      })
      .map((d): BlogPostMeta => {
        const slug = d.slug as string;
        const publishedAt = (d.publishedAt as string | null) ?? null;
        const tags = Array.isArray(d.tags)
          ? (d.tags as Array<{ tag?: string | null }>)
              .map((t) => t.tag)
              .filter((t): t is string => !!t)
          : [];

        return {
          slug,
          title: (d.title as string) ?? slug,
          description: (d.excerpt as string) ?? "",
          date: publishedAt ? dateLong(publishedAt) : "",
          iso: publishedAt ?? "",
          readTime: readTimeFromExcerpt(d.excerpt as string | null),
          tags,
        };
      });
  } catch (err) {
    console.error("[blogs] failed to list Payload posts", err);
  }

  const merged = [...BLOG_POSTS, ...cmsPosts];
  merged.sort((a, b) => (b.iso || "").localeCompare(a.iso || ""));
  return merged;
}
