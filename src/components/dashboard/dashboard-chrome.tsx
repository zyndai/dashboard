"use client";

import { EntitiesProvider } from "@/hooks/useEntities";
import { Sidebar } from "@/components/dashboard/sidebar";
import "@/components/dashboard/dashboard.css";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  return (
    <EntitiesProvider>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">{children}</div>
      </div>
    </EntitiesProvider>
  );
}
