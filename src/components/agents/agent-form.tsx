"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createAgent } from "@/apis/registry";
import { Capabilities } from "@/apis/registry/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface AgentFormProps {
  agent?: {
    name: string;
    description: string;
    capabilities?: Capabilities;
  };
  isEditing?: boolean;
}

export function AgentForm({ agent, isEditing = false }: AgentFormProps) {
  const router = useRouter();
  const { registryToken: accessToken } = useAuth();

  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [capabilityInput, setCapabilityInput] = useState("");
  const [capabilities, setCapabilities] = useState<string[]>(() => {
    if (!agent?.capabilities) return [];
    return Object.values(agent.capabilities).flat().filter(Boolean) as string[];
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCapability = () => {
    const trimmed = capabilityInput.trim();
    if (trimmed && !capabilities.includes(trimmed)) {
      setCapabilities((prev) => [...prev, trimmed]);
      setCapabilityInput("");
    }
  };

  const removeCapability = (cap: string) => {
    setCapabilities((prev) => prev.filter((c) => c !== cap));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCapability();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Agent name is required.");
      return;
    }

    if (!accessToken) {
      setError("Not authenticated.");
      return;
    }

    try {
      setSubmitting(true);

      const capabilitiesObj: Capabilities =
        capabilities.length > 0 ? { ai: capabilities } : {};

      if (isEditing) {
        setError("Edit functionality is not yet supported via the dashboard.");
        return;
      }

      await createAgent(accessToken, {
        name: name.trim(),
        description: description.trim() || undefined,
        capabilities: capabilitiesObj,
      });

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
      <h2 className="mb-6 text-lg sm:text-2xl font-bold text-[#E0E7FF]">
        {isEditing ? "Edit Agent" : "Create Agent"}
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
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
          <label className="text-sm text-[#E0E7FF]/70">Capabilities</label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. text-generation"
              value={capabilityInput}
              onChange={(e) => setCapabilityInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <button
              type="button"
              onClick={addCapability}
              className="flex cursor-pointer items-center gap-1.5 rounded border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-2 text-sm text-[#8B5CF6] transition-colors hover:bg-[#8B5CF6]/20"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          {capabilities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2.5 py-1 text-xs text-[#8B5CF6]"
                >
                  {cap}
                  <button
                    type="button"
                    onClick={() => removeCapability(cap)}
                    className="cursor-pointer text-[#8B5CF6]/60 transition-colors hover:text-[#8B5CF6]"
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
            className="cursor-pointer rounded border border-white/10 bg-white/5 px-6 py-2.5 min-h-[44px] text-sm text-[#E0E7FF] transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded bg-[#8B5CF6] px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
