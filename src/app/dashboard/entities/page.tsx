"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, Pencil } from "lucide-react";
import { useEntities } from "@/hooks/useEntities";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EntitiesPage() {
  const { entities, loading, error } = useEntities();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEntities = (entities || []).filter(
    (entity) =>
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entity.entity_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entity.fqan || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (
    status: string
  ): "active" | "inactive" | "deprecated" => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "active";
      case "INACTIVE":
        return "inactive";
      default:
        return "deprecated";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Entities
        </h2>
        <p className="mt-1 text-sm text-white/40">Manage your registered entities</p>
      </div>

      <div className="rounded border border-white/10 bg-white/[0.02]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-3 sm:flex-row sm:items-center">
          <h3 className="text-sm font-medium uppercase tracking-wider text-white/50">
            Entity Registry
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search entities..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="p-5 text-center">
            <div className="border border-red-500/20 bg-red-500/[0.06] px-4 py-8 text-red-400">
              {error}
            </div>
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="p-5 sm:p-10 text-center">
            <p className="text-base font-medium text-white/50">
              {searchTerm ? "No matching entities found" : "No entities found"}
            </p>
            <p className="mt-1 text-sm text-white/30">
              {searchTerm
                ? "Try a different search term."
                : "Create an entity to get started."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 cursor-pointer border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table headers={["Name", "FQAN", "Entity ID", "Status", "Tags", "Actions"]}>
              {filteredEntities.map((entity) => (
                <tr
                  key={entity.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td>
                    <div className="font-medium text-white">{entity.name}</div>
                    {entity.description && (
                      <div className="mt-0.5 text-xs text-white/25 truncate max-w-[200px]">
                        {entity.description}
                      </div>
                    )}
                  </td>
                  <td>
                    {entity.fqan ? (
                      <code className="border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04] px-2 py-1 font-mono text-xs text-[var(--color-accent)]">
                        {entity.fqan}
                      </code>
                    ) : (
                      <span className="text-xs italic text-white/25">—</span>
                    )}
                  </td>
                  <td>
                    <code className="border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-xs text-white/50">
                      {entity.entity_id
                        ? `${entity.entity_id.substring(0, 18)}...`
                        : "—"}
                    </code>
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(entity.status)}>
                      {entity.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    {entity.tags && entity.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {entity.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="active" className="text-[9px]">
                            {tag}
                          </Badge>
                        ))}
                        {entity.tags.length > 2 && (
                          <Badge variant="default" className="text-[9px]">
                            +{entity.tags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs italic text-[#E0E7FF]/30">None</span>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/entities/${entity.id}`}>
                        <button className="flex min-h-[44px] cursor-pointer items-center gap-1.5 border border-[var(--color-accent)]/20 bg-transparent px-3 py-1.5 text-xs text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/[0.06]">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </Link>
                      <Link href={`/dashboard/entities/${entity.id}/edit`}>
                        <button className="flex min-h-[44px] cursor-pointer items-center gap-1.5 border border-white/10 bg-transparent px-3 py-1.5 text-xs text-white/50 transition-colors hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
