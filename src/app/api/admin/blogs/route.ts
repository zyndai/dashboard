import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireZyndAdminApi } from "@/lib/admin-zynd-auth";

function slugify(v: string): string {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CreateBody = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().max(300).optional(),
  excerpt: z.string().max(1000).optional().nullable(),
  body: z.string().default(""),
  coverImage: z.string().url().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().max(300).optional().nullable(),
  seoDescription: z.string().max(1000).optional().nullable(),
  ogImage: z.string().url().optional().nullable(),
});

export async function GET() {
  const unauth = await requireZyndAdminApi();
  if (unauth) return unauth;

  const posts = await prisma.blogPost.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      tags: true,
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const unauth = await requireZyndAdminApi();
  if (unauth) return unauth;

  const json = await req.json().catch(() => null);
  const parsed = CreateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);

  const exists = await prisma.blogPost.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      body: data.body,
      coverImage: data.coverImage ?? null,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      status: data.status,
      tags: data.tags,
      authorEmail: null,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      ogImage: data.ogImage ?? null,
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
