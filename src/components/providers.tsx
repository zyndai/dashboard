"use client";

import { type ReactNode } from "react";
import { AuthProvider, type AuthSnapshot } from "@/hooks/useAuth";

export function Providers({
  initialAuth,
  children,
}: {
  initialAuth?: AuthSnapshot;
  children: ReactNode;
}) {
  return <AuthProvider initial={initialAuth}>{children}</AuthProvider>;
}
