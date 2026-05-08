import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  lexicalEditor,
  UploadFeature,
  HeadingFeature,
} from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { BlogPosts } from "./collections/BlogPosts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, BlogPosts],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3"] }),
      UploadFeature({
        collections: {
          media: {
            fields: [{ name: "alt", type: "text" }],
          },
        },
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.PAYLOAD_DATABASE_URL ||
        (process.env.PAYLOAD_USE_PRISMA_DB === "1"
          ? process.env.DIRECT_URL || process.env.DATABASE_URL
          : undefined),
    },
    push: process.env.NODE_ENV !== "production",
    migrationDir: path.resolve(dirname, "../payload-migrations"),
  }),
  sharp,
});
