"use client";

import Link from "next/link";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function NotFoundPage(): React.ReactElement {
  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "#fff" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "120px 20px 80px" }}>
        <h1 style={{ fontSize: "64px", fontWeight: 700, margin: "0 0 16px 0", letterSpacing: "-0.04em" }}>404</h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", margin: "0 0 32px 0" }}>
          Page not found
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            backgroundColor: "#6366F1",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none"
          }}
        >
          Go Home
        </Link>
      </div>
      <Footer />
    </div>
  );
}
