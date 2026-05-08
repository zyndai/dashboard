"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "developer", label: "Developer", description: "Building agents and tools" },
  { value: "student", label: "Student", description: "Learning and experimenting" },
  { value: "researcher", label: "Researcher", description: "AI/ML research" },
  { value: "enterprise", label: "Enterprise", description: "Building for an organization" },
  { value: "other", label: "Other", description: "Something else" },
];

export default function OnboardSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameError, setUsernameError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth"); return; }
      const meta = user.user_metadata;
      if (meta?.full_name) setName(meta.full_name);
      else if (meta?.name) setName(meta.name);
      setLoading(false);
    });
  }, [router]);

  const checkUsername = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 3) { setUsernameStatus("idle"); setUsernameError(""); return; }
    setUsernameStatus("checking");
    setUsernameError("");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/developer/username-check?username=${encodeURIComponent(value)}`);
        if (!res.ok) { setUsernameStatus("idle"); setUsernameError("Unable to check availability. Please try again."); return; }
        const data = await res.json();
        if (data.available) { setUsernameStatus("available"); setUsernameError(""); }
        else { setUsernameStatus("taken"); setUsernameError(data.reason || "Username is not available"); }
      } catch { setUsernameStatus("idle"); setUsernameError("Failed to check availability."); }
    }, 400);
  }, []);

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(cleaned);
    checkUsername(cleaned);
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) { setError("Name is required"); return; }
    if (!username || username.length < 3) { setError("Username must be at least 3 characters"); return; }
    if (usernameStatus !== "available") { setError("Please choose an available username"); return; }
    if (!role) { setError("Please select your role"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/developer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Registration failed" }));
        setError(data.error || "Registration failed");
        setSubmitting(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000", color: "#fff" }}>
        <div style={{ width: "24px", height: "24px", border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.2 }}>
            Set Up Your <span style={{ color: "#8B5CF6" }}>Identity</span>
          </h1>
          <p style={{ fontSize: "14px", color: "#999", margin: "8px 0 0 0" }}>
            Your username becomes your permanent developer identity
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "14px", color: "#ccc", marginBottom: "8px", fontWeight: 500 }}>Display Name</label>
            <input type="text" placeholder="Alice Johnson" value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "12px", fontSize: "14px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Username */}
          <div>
            <label style={{ display: "block", fontSize: "14px", color: "#ccc", marginBottom: "8px", fontWeight: 500 }}>
              Username <span style={{ color: "#666" }}>(permanent, cannot be changed)</span>
            </label>
            <div style={{ position: "relative" }}>
              <input type="text" placeholder="acme-corp" value={username} onChange={(e) => handleUsernameChange(e.target.value)} maxLength={40}
                style={{
                  width: "100%", padding: "12px 40px 12px 12px", fontSize: "14px", backgroundColor: "transparent",
                  border: `1px solid ${usernameStatus === "taken" ? "rgba(239,68,68,0.4)" : usernameStatus === "available" ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "6px", color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.4)")}
                onBlur={(e) => {
                  if (usernameStatus === "taken") e.target.style.borderColor = "rgba(239,68,68,0.4)";
                  else if (usernameStatus === "available") e.target.style.borderColor = "rgba(16,185,129,0.4)";
                  else e.target.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              />
              <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
                {usernameStatus === "checking" && <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid #8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />}
                {usernameStatus === "available" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>}
                {usernameStatus === "taken" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>}
              </div>
            </div>
            {usernameError && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "6px" }}>{usernameError}</p>}
            {usernameStatus === "available" && <p style={{ fontSize: "12px", color: "#10b981", marginTop: "6px" }}>Username is available</p>}
          </div>

          {/* Role */}
          <div>
            <label style={{ display: "block", fontSize: "14px", color: "#ccc", marginBottom: "12px", fontWeight: 500 }}>Who are you?</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {ROLES.map((r) => (
                <button key={r.value} onClick={() => setRole(r.value)} style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px",
                  border: `1px solid ${role === r.value ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.1)"}`,
                  backgroundColor: role === r.value ? "rgba(139,92,246,0.1)" : "transparent",
                  borderRadius: "6px", cursor: "pointer", textAlign: "left",
                  color: role === r.value ? "#fff" : "#999", fontSize: "14px", transition: "all 0.2s",
                }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${role === r.value ? "#8B5CF6" : "rgba(255,255,255,0.2)"}`,
                    backgroundColor: role === r.value ? "#8B5CF6" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {role === r.value && <div style={{ width: "8px", height: "8px", backgroundColor: "#fff", borderRadius: "50%" }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{r.label}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{r.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ textAlign: "center", fontSize: "14px", color: "#f87171", margin: 0 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={submitting || usernameStatus !== "available" || !name.trim() || !role}
            style={{
              marginTop: "12px", padding: "14px",
              backgroundColor: submitting || usernameStatus !== "available" || !name.trim() || !role ? "rgba(139,92,246,0.5)" : "#8B5CF6",
              border: "none", borderRadius: "6px", color: "#fff", fontSize: "14px", fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.5 : 1, transition: "all 0.2s",
            }}
          >
            {submitting ? "Creating identity..." : "Create Developer Identity"}
          </button>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#666", margin: 0 }}>
            Your username will be part of your agent URLs and cannot be changed later.
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
