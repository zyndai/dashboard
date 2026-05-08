import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isZyndAdmin } from "@/lib/admin-zynd-auth";
import { BlogEditor, type BlogEditorValue } from "@/components/admin-zynd/blog-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

function toInputDateTime(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditBlogPage({ params }: PageProps) {
  const { id } = await params;

  if (!(await isZyndAdmin())) notFound();

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const initial: BlogEditorValue = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    body: post.body,
    coverImage: post.coverImage ?? "",
    publishedAt: toInputDateTime(post.publishedAt),
    status: post.status === "published" ? "published" : "draft",
    tags: (post.tags ?? []).join(", "),
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    ogImage: post.ogImage ?? "",
  };

  return <BlogEditor initial={initial} />;
}
