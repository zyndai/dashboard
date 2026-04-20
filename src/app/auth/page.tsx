"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const { authenticated, login, loginWithGithub } = useAuth();

  useEffect(() => {
    if (authenticated) {
      router.push("/dashboard");
    }
  }, [authenticated, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000",
      fontFamily: "sans-serif",
      color: "#fff",
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "400px",
        padding: "40px",
      }}>
        <h1 style={{ fontSize: "32px", marginBottom: "20px", fontWeight: 700 }}>
          Sign in to <span style={{ color: "#8B5CF6" }}>ZyndAI</span>
        </h1>

        <button
          onClick={login}
          style={{
            width: "100%",
            padding: "12px 20px",
            marginBottom: "12px",
            backgroundColor: "#fff",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Sign in with Google
        </button>

        <button
          onClick={loginWithGithub}
          style={{
            width: "100%",
            padding: "12px 20px",
            backgroundColor: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Sign in with GitHub
        </button>

        <p style={{
          marginTop: "20px",
          fontSize: "14px",
          color: "#999",
        }}>
          Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  );
}
