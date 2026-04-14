"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface AgentFormProps {
  agent?: {
    name: string;
    description: string;
    tags?: string[];
  };
  isEditing?: boolean;
  agentId?: string;
}

export function AgentForm({ agent, isEditing = false, agentId }: AgentFormProps) {
  const router = useRouter();
  const { authenticated } = useAuth();

  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(agent?.tags ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Agent name is required.");
      return;
    }

    if (!authenticated) {
      setError("Not authenticated.");
      return;
    }

    try {
      setSubmitting(true);
      const supabase = createClient();

      if (isEditing && agentId) {
        const { error: updateError } = await supabase
          .from("agents")
          .update({
            name: name.trim(),
            description: description.trim() || null,
            tags: tags.length > 0 ? tags : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", agentId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("agents").insert({
          name: name.trim(),
          description: description.trim() || null,
          tags: tags.length > 0 ? tags : null,
          status: "active",
        });

        if (insertError) throw insertError;
      }

      router.push("/dashboard/agents");
    } catch (err) {
      console.error(err);
      setError("Failed to save agent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-full sm:max-w-2xl">
      <h2 className="mb-6 text-lg sm:text-2xl font-bold text-white">
        {isEditing ? "Edit Agent" : "Create Agent"}
      </h2>

      {error && (
        <div className="mb-4 border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Name"
          placeholder="My Agent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="What does this agent do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white/50">Tags</label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. text-generation"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <button
              type="button"
              onClick={addTag}
              className="flex cursor-pointer items-center gap-1.5 border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/[0.08] px-3 py-2 text-sm text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/15"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/[0.08] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)]"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="cursor-pointer text-[var(--color-accent)]/50 transition-colors hover:text-[var(--color-accent)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer border border-white/10 bg-white/[0.03] px-6 py-2.5 min-h-[44px] text-sm text-white transition-colors hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer bg-[var(--color-accent)] px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? "Saving..."
              : isEditing
                ? "Update Agent"
                : "Create Agent"}
          </button>
        </div>
      </form>
    </div>
  );
}
