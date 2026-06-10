"use client";

import { Suspense } from "react";
import { RegistryPage } from "@/components/RegistryPage";

function LoadingFallback() {
  return (
    <div style={{ background: "#060912", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "28px", height: "28px", border: "2px solid rgba(255,255,255,0.08)", borderTop: "2px solid rgba(255,255,255,0.4)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Registry() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegistryPage />
    </Suspense>
  );
}
