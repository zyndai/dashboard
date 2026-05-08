/**
 * One-time scaffolded migration: insert Payload entries for every static
 * BLOG_POSTS row that doesn't already exist in the CMS.
 *
 * - Idempotent — safe to re-run; re-uses entries by slug.
 * - Drafts only. Static .tsx files keep serving the public URL until you
 *   manually paste the body into the CMS and delete the corresponding
 *   src/app/(site)/blogs/<slug>/page.tsx.
 * - Body is an empty Lexical document — fill it in via /admin.
 *
 * Run with:
 *   PAYLOAD_DATABASE_URL=... PAYLOAD_SECRET=... \
 *     npx tsx scripts/seed-blog-posts.mts
 */
import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "..");

loadEnv({ path: path.join(root, ".env") });
loadEnv({ path: path.join(root, ".env.local"), override: true });

const { getPayload } = await import("payload");
const configModule = await import("../src/payload.config.ts");
const { BLOG_POSTS } = await import("../src/lib/blogs/posts.ts");

const cmsConfig = await (configModule.default ?? configModule);
const payload = await getPayload({ config: cmsConfig });

function placeholderLexical(text: string) {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          children: [
            {
              type: "text",
              format: 0,
              mode: "normal" as const,
              style: "",
              text,
              detail: 0,
              version: 1,
            },
          ],
        },
      ],
    },
  };
}

let created = 0;
let skipped = 0;

for (const post of BLOG_POSTS) {
  const existing = await payload.find({
    collection: "blog-posts",
    where: { slug: { equals: post.slug } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    console.log(`[skip] ${post.slug} — already exists in CMS (id=${existing.docs[0].id})`);
    skipped += 1;
    continue;
  }

  await payload.create({
    collection: "blog-posts",
    overrideAccess: true,
    data: {
      title: post.title,
      slug: post.slug,
      excerpt: post.description,
      publishedAt: new Date(post.iso).toISOString(),
      tags: post.tags.map((tag) => ({ tag })),
      body: placeholderLexical(
        `${post.description}\n\n(This post still ships from src/app/(site)/blogs/${post.slug}/page.tsx — edit and publish here to take over.)`,
      ),
      status: "draft",
    },
  });

  console.log(`[create] ${post.slug} — drafted in CMS`);
  created += 1;
}

console.log(`\nDone. created=${created} skipped=${skipped} total=${BLOG_POSTS.length}`);
process.exit(0);
