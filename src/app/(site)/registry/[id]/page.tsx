"use client";

import { AgentDetailPage } from "@/components/AgentDetailPage";

export default function RegistryDetail({ params }: { params: Promise<{ id: string }> }) {
  return <AgentDetailPage params={params} />;
}
