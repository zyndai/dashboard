import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config();

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
  migrations: {
    path: path.join(__dirname, "prisma", "migrations"),
  },
});
