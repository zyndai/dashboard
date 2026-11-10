"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { n8nFetch } from "@/lib/n8n/client";
import { validateListingForm, type ListingFormValues } from "@/lib/n8n/format";
import type { N8nListing } from "@/lib/n8n/types";
import { ErrorBox, FieldError } from "./ui";

const CATEGORIES = ["general", "ai", "data", "finance", "productivity", "marketing", "developer-tools", "research"];

const EMPTY: ListingFormValues = { name: "", summary: "", category: "general", tags: "", workflowId: "", priceUsd: "" };

/** M4.7. Creates a DRAFT listing, then activates it so it is registered on the network. */
export function ListingForm({ initial, listingId }: { initial?: ListingFormValues; listingId?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<ListingFormValues>(initial ?? EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validateListingForm>["errors"]>({});
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const editing = Boolean(listingId);
  const set = (k: keyof ListingFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent, activate: boolean) {
    e.preventDefault();
    setProblem(null);
    const { errors: errs, payload } = validateListingForm(values);
    setErrors(errs);
    if (!payload) return;
    setBusy(true);
    try {
      if (editing) {
        // PATCH takes null to clear these two.
        await n8nFetch(`/listings/${encodeURIComponent(listingId as string)}`, {
          method: "PATCH",
          body: { name: payload.name, summary: payload.summary, tags: payload.tags, workflowId: payload.workflowId ?? null, priceUsd: payload.priceUsd ?? null },
        });
        router.push(`/dashboard/n8n/listings/${encodeURIComponent(listingId as string)}`);
        router.refresh();
        return;
      }
      const created = await n8nFetch<N8nListing>("/listings", { method: "POST", body: payload });
      if (activate) {
        try {
          await n8nFetch(`/listings/${encodeURIComponent(created.id)}/activate`, { method: "POST" });
        } catch (err) {
          // The listing exists as a DRAFT; send them to it so they can retry activation.
          router.push(`/dashboard/n8n/listings/${encodeURIComponent(created.id)}?activationFailed=${encodeURIComponent((err as Error).message)}`);
          return;
        }
      }
      router.push(`/dashboard/n8n/listings/${encodeURIComponent(created.id)}`);
    } catch (err) {
      setProblem((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => submit(e, true)} noValidate style={{ maxWidth: "640px" }}>
      {problem && <ErrorBox message={problem} />}

      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="l-name">Name</label>
        <input id="l-name" className="dashboard-input" value={values.name} onChange={set("name")} maxLength={100} placeholder="Weather forecaster" />
        <FieldError message={errors.name} />
      </div>

      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="l-summary">Summary</label>
        <textarea id="l-summary" className="dashboard-textarea" value={values.summary} onChange={set("summary")} maxLength={300} placeholder="One or two sentences on what your agent does. Other agents search on this." />
        <FieldError message={errors.summary} />
      </div>

      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="l-category">Category</label>
        <input id="l-category" className="dashboard-input" list="n8n-categories" value={values.category} onChange={set("category")} maxLength={50} disabled={editing} />
        <datalist id="n8n-categories">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
        {editing && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "rgba(246,246,246,0.4)" }}>The category is fixed once the listing is created.</p>}
        <FieldError message={errors.category} />
      </div>

      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="l-tags">Tags</label>
        <input id="l-tags" className="dashboard-input" value={values.tags} onChange={set("tags")} placeholder="weather, forecast, india (comma separated, up to 10)" />
        <FieldError message={errors.tags} />
      </div>

      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="l-wf">n8n workflow ID <span style={{ textTransform: "none", opacity: 0.6 }}>(optional)</span></label>
        <input id="l-wf" className="dashboard-input" value={values.workflowId} onChange={set("workflowId")} maxLength={100} placeholder="For your own reference" />
        <FieldError message={errors.workflowId} />
      </div>

      <div className="dashboard-form-group">
        <label className="dashboard-label" htmlFor="l-price">Price per call (USD)</label>
        <input id="l-price" className="dashboard-input" inputMode="decimal" value={values.priceUsd} onChange={set("priceUsd")} placeholder="0.05" />
        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "rgba(246,246,246,0.4)" }}>
          What a caller pays for one call. Enter 0 for free. Leave blank to use the platform default.
        </p>
        <FieldError message={errors.priceUsd} />
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {editing ? (
          <button type="submit" className="dashboard-button" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        ) : (
          <>
            <button type="submit" className="dashboard-button" disabled={busy}>{busy ? "Working…" : "Create and activate"}</button>
            <button type="button" className="dashboard-button-secondary" disabled={busy} onClick={(e) => submit(e, false)}>Save as draft</button>
          </>
        )}
      </div>
      {editing && (
        <p style={{ marginTop: "16px", fontSize: "12px", color: "rgba(246,246,246,0.4)" }}>
          Name, summary and tags are updated in the Gateway and the agent card it serves. The network registry keeps the values from registration.
        </p>
      )}
    </form>
  );
}
