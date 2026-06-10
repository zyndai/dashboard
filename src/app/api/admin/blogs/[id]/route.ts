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

const UpdateBody = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().max(300).optional(),
  excerpt: z.string().max(1000).nullable().optional(),
  body: z.string().optional(),
  coverImage: z.string().url().nullable().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(300).nullable().optional(),
  seoDescription: z.string().max(1000).nullable().optional(),
  ogImage: z.string().url().nullable().optional(),
});

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const unauth = await requireZyndAdminApi();
  if (unauth) return unauth;
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const unauth = await requireZyndAdminApi();
  if (unauth) return unauth;
  const { id } = await params;

  const json = await req.json().catch(() => null);
  const parsed = UpdateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextSlug = data.slug !== undefined ? slugify(data.slug) : undefined;
  if (nextSlug && nextSlug !== existing.slug) {
    const conflict = await prisma.blogPost.findUnique({ where: { slug: nextSlug } });
    if (conflict) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(nextSlug !== undefined && { slug: nextSlug }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      ...(data.publishedAt !== undefined && {
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
    },
  });
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const unauth = await requireZyndAdminApi();
  if (unauth) return unauth;
  const { id } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
