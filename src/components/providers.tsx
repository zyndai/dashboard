"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { AuthProvider, type AuthSnapshot } from "@/hooks/useAuth";

export function Providers({
  initialAuth,
  children,
}: {
  initialAuth?: AuthSnapshot;
  children: ReactNode;
}) {
  const [queryClient] = useState(getQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initial={initialAuth}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
