"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { EntitiesProvider } from "@/hooks/useEntities";
import { Sidebar } from "@/components/dashboard/sidebar";
import "@/components/dashboard/dashboard.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, authenticated, needsOnboarding } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/auth");
    } else if (ready && authenticated && needsOnboarding) {
      router.push("/onboard/setup");
    }
  }, [ready, authenticated, needsOnboarding, router]);

  if (!ready || !authenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}>
        <div style={{
          width: "24px",
          height: "24px",
          border: "2px solid rgba(139, 92, 246, 0.2)",
          borderTop: "2px solid #8B5CF6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <EntitiesProvider>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          {children}
        </div>
      </div>
    </EntitiesProvider>
  );
}
