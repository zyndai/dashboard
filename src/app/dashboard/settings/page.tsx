"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, developer } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState({ name: "", role: "", country: "" });

  useEffect(() => {
    if (developer) {
      setFormData({
        name: developer.name || "",
        role: developer.role || "",
        country: developer.country || "",
      });
    }
  }, [developer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/developer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessageType("success");
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessageType("error");
        setMessage(data.error || "Failed to update profile");
      }
    } catch {
      setMessageType("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account preferences and profile information</p>
        </div>
      </div>

      <div className="dashboard-grid-2col">
        <div className="dashboard-card">
          <h2>Profile Settings</h2>
          <form onSubmit={handleSubmit}>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Display Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="dashboard-input" placeholder="Your display name" />
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="dashboard-input" style={{ cursor: "pointer" }}>
                <option value="">Select your role</option>
                <option value="developer">Developer</option>
                <option value="student">Student</option>
                <option value="researcher">Researcher</option>
                <option value="enterprise">Enterprise</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="dashboard-form-group">
              <label className="dashboard-label">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className="dashboard-input" placeholder="Your country" />
            </div>
            {message && (
              <div style={{
                padding: "12px", marginBottom: "16px", borderRadius: "6px",
                backgroundColor: messageType === "success" ? "rgba(0, 255, 102, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: messageType === "success" ? "var(--color-success)" : "#ef4444",
                border: `1px solid ${messageType === "success" ? "rgba(0, 255, 102, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                fontSize: "13px",
              }}>
                {message}
              </div>
            )}
            <button type="submit" disabled={saving} className="dashboard-button" style={{ width: "100%", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="dashboard-card">
          <h2>Account Information</h2>
          {[
            { label: "Email Address", value: user?.email },
            { label: "Username", value: developer?.username ? `@${developer.username}` : "—" },
            {
              label: "Account Created",
              value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—",
            },
            { label: "Developer ID", value: developer?.developer_id || "—", mono: true },
          ].map((field) => (
            <div key={field.label} className="dashboard-form-group">
              <label className="dashboard-label">{field.label}</label>
              <div style={{
                padding: "12px",
                backgroundColor: "rgba(139, 92, 246, 0.05)",
                border: "1px solid rgba(139, 92, 246, 0.15)",
                borderRadius: "6px",
                fontSize: field.mono ? "12px" : "14px",
                fontFamily: field.mono ? "monospace" : "inherit",
                color: "rgba(246, 246, 246, 0.8)",
                wordBreak: "break-all" as const,
              }}>
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
