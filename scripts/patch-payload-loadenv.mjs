#!/usr/bin/env node
/**
 * Local patch for @payloadcms/payload v3.84 + Next.js 16.2.
 *
 * payload/dist/bin/loadEnv.js does:
 *   import nextEnvImport from '@next/env';
 *   const { loadEnvConfig } = nextEnvImport;
 *
 * Under tsx's CJS loader (used by `payload` CLI and any tsx-driven script
 * that imports payload transitively), `nextEnvImport` resolves to
 * undefined, crashing the whole import chain. We don't need Payload's env
 * loader — every entry point that ends up here loads .env via dotenv
 * first — so we replace the module with a no-op.
 *
 * Re-applies on every `npm install` via the postinstall hook in
 * package.json. Remove this patch once Payload supports Next 16's
 * @next/env shape upstream.
 */
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../node_modules/payload/dist/bin/loadEnv.js");

if (!existsSync(target)) {
  // Payload not installed yet — nothing to patch.
  process.exit(0);
}

const noop = `/* Local patch — replaces upstream loadEnv to dodge an @next/env CJS interop
   crash under tsx. Caller is expected to load .env via dotenv first. */
export function loadEnv() {}
`;

writeFileSync(target, noop);
console.log(`[patch] payload/dist/bin/loadEnv.js → no-op`);
