import type { CollectionConfig } from "payload";

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  labels: { singular: "Blog Post", plural: "Blog Posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "publishedAt", "updatedAt"],
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
      admin: { description: "URL path under /blogs/" },
    },
    {
      name: "excerpt",
      type: "textarea",
      admin: { description: "Short summary shown on the blog listing" },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      hasMany: false,
    },
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
    {
      name: "body",
      type: "richText",
      required: true,
    },
    {
      name: "seo",
      type: "group",
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
