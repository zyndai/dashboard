import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blogs/posts";
import { listCards, cardCanonicalUrl } from "@/lib/cards";

const BASE_URL = "https://www.zynd.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cards = await listCards();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date("2026-03-26"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/registry`,
      lastModified: new Date("2026-03-26"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: new Date("2026-05-06"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/directory`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date("2026-03-26"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: new Date("2026-03-26"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${BASE_URL}/blogs/${p.slug}`,
    lastModified: new Date(p.iso),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const profileEntries: MetadataRoute.Sitemap = cards.map((c) => ({
    url: cardCanonicalUrl(c),
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const skillSet = new Set<string>();
  for (const c of cards) {
    for (const s of c.skills) {
      if (s.name) skillSet.add(encodeURIComponent(s.name.toLowerCase().replace(/\s+/g, "-")));
    }
  }
  const tagEntries: MetadataRoute.Sitemap = Array.from(skillSet).map((slug) => ({
    url: `${BASE_URL}/tag/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries, ...profileEntries, ...tagEntries];
}
