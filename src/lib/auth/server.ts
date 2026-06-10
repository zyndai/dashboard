import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { DeveloperInfo } from "@/hooks/useAuth";


export interface ServerAuth {
  user: User | null;
  developer: DeveloperInfo | null;
  needsOnboarding: boolean;
}

export const getServerAuth = cache(async (): Promise<ServerAuth> => {
  const cookieStore = await cookies();
  // Skip the Supabase + DB round-trip when no auth cookie is present.
  // Supabase sets cookies prefixed with `sb-` once a session exists.
  const hasAuthCookie = cookieStore.getAll().some((c) => c.name.startsWith("sb-"));
  if (!hasAuthCookie) {
    return { user: null, developer: null, needsOnboarding: false };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, developer: null, needsOnboarding: false };
  }

  const devKey = await prisma.developerKey.findUnique({
    where: { userId: user.id },
    select: {
      developerId: true,
      publicKey: true,
      name: true,
      username: true,
      role: true,
      country: true,
    },
  });

  const developer: DeveloperInfo | null = devKey
    ? {
        developer_id: devKey.developerId,
        public_key: devKey.publicKey,
        name: devKey.name,
        username: devKey.username ?? undefined,
        role: devKey.role ?? undefined,
        country: devKey.country ?? undefined,
      }
    : null;

  return {
    user,
    developer,
    needsOnboarding: !developer || !developer.username,
  };
});
