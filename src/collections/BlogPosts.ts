import type { CollectionConfig } from "payload";

const slugify = (val: string): string =>
  val
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  labels: { singular: "Post", plural: "Posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "publishedAt", "updatedAt"],
    preview: (doc) => {
      const slug = (doc?.slug as string) || "";
      return `${SITE_URL}/blogs/${slug}?preview=true`;
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return { status: { equals: "published" } };
    },
  },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Auto-generated from the title; edit if needed." },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value && typeof value === "string" && value.length > 0) return value;
            const title = data?.title;
            if (typeof title === "string" && title.length > 0) return slugify(title);
            return value;
          },
        ],
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      admin: { description: "One-line summary shown on the blog list." },
    },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "author", type: "relationship", relationTo: "users", hasMany: false },
    {
      name: "publishedAt",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text" }],
    },
    { name: "body", type: "richText", required: true },
    {
      name: "seo",
      type: "group",
      label: "SEO overrides",
      admin: { description: "Optional — falls back to title/excerpt/cover." },
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
