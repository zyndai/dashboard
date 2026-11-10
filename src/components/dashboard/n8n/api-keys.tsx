"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { n8nFetch, useN8nData } from "@/lib/n8n/client";
import { GRACE_OPTIONS, formatUsd, keyState, maskKey, validateKeyForm, type KeyFormValues } from "@/lib/n8n/format";
import { KEY_PERMISSIONS, type CreatedN8nApiKey, type N8nApiKey, type RotatedN8nApiKey } from "@/lib/n8n/types";
import { CopyField, Empty, ErrorBox, FieldError, Loading } from "./ui";

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");

/** M4.8: prefix only (masked), permissions, spend, expiry. */
export function ApiKeysTable() {
  const { data, error, loading, reload } = useN8nData<{ keys: N8nApiKey[] }>("/api-keys");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rotateId, setRotateId] = useState<string | null>(null);
  const [grace, setGrace] = useState<number>(24);
  const [rotated, setRotated] = useState<RotatedN8nApiKey | null>(null);

  if (loading) return <Loading what="API keys" />;
  const keys = data?.keys ?? [];

  async function revoke(id: string) {
    setBusyId(id);
    try {
      await n8nFetch(`/api-keys/${encodeURIComponent(id)}`, { method: "DELETE" });
      setConfirmId(null);
      setActionError(null);
      await reload();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  // M6.4: the replacement's plaintext is shown here once; the old key keeps working until `previous.expiresAt`.
  async function rotate(id: string) {
    setBusyId(id);
    try {
      setRotated(await n8nFetch<RotatedN8nApiKey>(`/api-keys/${encodeURIComponent(id)}/rotate`, { method: "POST", body: { graceHours: grace } }));
      setRotateId(null);
      setActionError(null);
      await reload();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {(error || actionError) && <ErrorBox message={(actionError ?? error) as string} />}
      {rotated && (
        <div className="dashboard-card" style={{ borderColor: "rgba(255,184,0,0.4)", marginBottom: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: "18px" }}>New key for &ldquo;{rotated.name}&rdquo;: copy it now</h2>
          <p style={{ fontSize: "14px", color: "rgba(246,246,246,0.7)", lineHeight: 1.6 }}>
            Paste it into the <strong>API Key</strong> field of the Zynd API credential in n8n. This is the only time it is shown.{" "}
            {rotated.previous.expiresAt && new Date(rotated.previous.expiresAt).getTime() > Date.now()
              ? <>The old key <code>{maskKey(rotated.previous.keyPrefix)}</code> keeps working until {new Date(rotated.previous.expiresAt).toLocaleString()}.</>
              : <>The old key <code>{maskKey(rotated.previous.keyPrefix)}</code> no longer works.</>}
          </p>
          <CopyField value={rotated.key} secret />
          <button className="dashboard-button-secondary" style={{ marginTop: 16 }} onClick={() => setRotated(null)}>I have saved it</button>
        </div>
      )}
      <div className="dashboard-card" style={{ padding: 0 }}>
        {keys.length === 0 ? (
          <Empty title="No API keys yet">
            n8n uses a key to talk to the Gateway. <Link href="/dashboard/n8n/api-keys/new" style={{ color: "var(--color-accent)" }}>Create one</Link>.
          </Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dashboard-table">
              <thead>
                <tr><th>Name</th><th>Key</th><th>Permissions</th><th>Spent / cap</th><th>Expires</th><th>Last used</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {keys.map((k) => {
                  const state = keyState(k);
                  return (
                    <tr key={k.id} style={state === "active" ? undefined : { opacity: 0.55 }}>
                      <td style={{ fontWeight: 500, color: "#fff" }}>{k.name}{state !== "active" && <span className="dashboard-badge badge-muted" style={{ marginLeft: 8 }}>{state}</span>}</td>
                      <td><code style={{ fontFamily: "monospace", fontSize: "12px" }}>{maskKey(k.keyPrefix)}</code></td>
                      <td>{k.permissions.join(", ")}</td>
                      <td>{formatUsd(k.spentUsd)} / {k.spendCapUsd === null ? "no cap" : formatUsd(k.spendCapUsd)}</td>
                      <td>{when(k.expiresAt)}</td>
                      <td>{when(k.lastUsedAt)}</td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          {state !== "active" ? null : rotateId === k.id ? (
                            <>
                              <select aria-label="Keep the old key working for" className="dashboard-input" style={{ padding: "4px 8px", fontSize: "12px", width: "auto" }} value={grace} onChange={(e) => setGrace(Number(e.target.value))}>
                                {GRACE_OPTIONS.map((o) => <option key={o.hours} value={o.hours}>Old key works {o.hours === 0 ? "no longer" : `for ${o.label}`}</option>)}
                              </select>
                              <button className="dashboard-button" style={{ padding: "6px 12px", fontSize: "12px" }} disabled={busyId === k.id} onClick={() => rotate(k.id)}>{busyId === k.id ? "…" : "Rotate"}</button>
                              <button className="dashboard-button-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setRotateId(null)}>Cancel</button>
                            </>
                          ) : (
                            <button className="dashboard-button-secondary" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "4px" }} onClick={() => { setRotateId(k.id); setConfirmId(null); }}>Rotate…</button>
                          )}
                          {state === "revoked" ? null : confirmId === k.id ? (
                            <>
                              <button className="dashboard-button" style={{ background: "#ef4444", padding: "6px 12px", fontSize: "12px" }} disabled={busyId === k.id} onClick={() => revoke(k.id)}>{busyId === k.id ? "…" : "Revoke"}</button>
                              <button className="dashboard-button-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setConfirmId(null)}>Keep</button>
                            </>
                          ) : (
                            <button className="dashboard-button-secondary" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "4px" }} onClick={() => setConfirmId(k.id)}>Revoke…</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

const DESCRIPTIONS: Record<string, string> = {
  search: "Search agents",
  call: "Call agents and pay for them",
  complete: "Serve jobs: list listings, bind the Zynd Trigger, complete jobs",
};

/** M4.8: create a key. The plaintext is shown once, here, and never again. */
export function ApiKeyForm() {
  const router = useRouter();
  const [values, setValues] = useState<KeyFormValues>({ name: "", permissions: [...KEY_PERMISSIONS], spendCapUsd: "", expiresOn: "" });
  const [errors, setErrors] = useState<ReturnType<typeof validateKeyForm>["errors"]>({});
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedN8nApiKey | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    const { errors: errs, payload } = validateKeyForm(values);
    setErrors(errs);
    if (!payload) return;
    setBusy(true);
    try {
      setCreated(await n8nFetch<CreatedN8nApiKey>("/api-keys", { method: "POST", body: payload }));
    } catch (err) {
      setProblem((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <div style={{ maxWidth: "640px" }}>
        <div className="dashboard-card" style={{ borderColor: "rgba(255,184,0,0.4)" }}>
          <h2 style={{ marginTop: 0, fontSize: "18px" }}>Copy your API key now</h2>
          <p style={{ fontSize: "14px", color: "rgba(246,246,246,0.7)", lineHeight: 1.6 }}>
            This is the only time the full key is shown. We store just a fingerprint, so we cannot show it again. Paste it into the <strong>API Key</strong> field of the Zynd API credential in n8n.
          </p>
          <CopyField value={created.key} secret />
          <label style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "20px", fontSize: "14px", cursor: "pointer" }}>
            <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
            I have saved this key somewhere safe
          </label>
        </div>
        <button className="dashboard-button" disabled={!saved} onClick={() => { setCreated(null); router.push("/dashboard/n8n/api-keys"); router.refresh(); }}>Done</button>
      </div>
    );
  }

  const toggle = (p: string) =>
    setValues((v) => ({ ...v, permissions: v.permissions.includes(p) ? v.permissions.filter((x) => x !== p) : [...v.permissions, p] }));

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: "640px" }}>
      {problem && <ErrorBox message={problem} />}
      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="k-name">Name</label>
        <input id="k-name" className="dashboard-input" value={values.name} maxLength={100} placeholder="Production n8n" onChange={(e) => setValues({ ...values, name: e.target.value })} />
        <FieldError message={errors.name} />
      </div>

      <div className="dashboard-form-group">
        <span className="dashboard-label">Permissions</span>
        {KEY_PERMISSIONS.map((p) => (
          <label key={p} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "6px 0", fontSize: "14px", cursor: "pointer" }}>
            <input type="checkbox" checked={values.permissions.includes(p)} onChange={() => toggle(p)} style={{ marginTop: 3 }} />
            <span><code>{p}</code> <span style={{ color: "rgba(246,246,246,0.5)" }}>{DESCRIPTIONS[p]}</span></span>
          </label>
        ))}
        <FieldError message={errors.permissions} />
      </div>

      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="k-cap">Spend cap (USD)</label>
        <input id="k-cap" className="dashboard-input" inputMode="decimal" value={values.spendCapUsd} placeholder="No cap" onChange={(e) => setValues({ ...values, spendCapUsd: e.target.value })} />
        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "rgba(246,246,246,0.4)" }}>The most this key may spend in total on agent calls. Calls beyond it fail with &quot;Spend cap exceeded&quot;.</p>
        <FieldError message={errors.spendCapUsd} />
      </div>

      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="k-exp">Expires</label>
        <input id="k-exp" type="date" className="dashboard-input" value={values.expiresOn} onChange={(e) => setValues({ ...values, expiresOn: e.target.value })} />
        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "rgba(246,246,246,0.4)" }}>Leave empty for a key that never expires.</p>
        <FieldError message={errors.expiresOn} />
      </div>

      <button type="submit" className="dashboard-button" disabled={busy}>{busy ? "Creating…" : "Create key"}</button>
    </form>
  );
}
