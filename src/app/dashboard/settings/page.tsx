"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Copy,
  Plus,
  Loader2,
  CheckCircle2,
  Settings as SettingsIcon,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createApiKey, getApiKeys, deleteApiKey } from "@/apis/registry";
import { APIKeyResponse } from "@/apis/registry/types";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";

const FULL_KEYS_STORAGE_KEY = "zynd_api_full_keys";

function loadFullKeysFromStorage(): Record<string, string> {
  try {
    const stored = localStorage.getItem(FULL_KEYS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveFullKeysToStorage(keys: Record<string, string>) {
  try {
    localStorage.setItem(FULL_KEYS_STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // storage errors are non-critical
  }
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKeyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fullKeys, setFullKeys] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const { registryToken: accessToken, user } = useAuth();

  useEffect(() => {
    setFullKeys(loadFullKeysFromStorage());
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      if (!accessToken) throw new Error("No access token");
      const keys = await getApiKeys(accessToken);
      setApiKeys(keys);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      showNotification("error", "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      setCreating(true);
      if (!accessToken) throw new Error("No access token");
      const key = await createApiKey(accessToken);
      setNewApiKey(key);
      setShowNewKeyDialog(true);
      await fetchApiKeys();

      if (key) {
        const updatedKeys = await getApiKeys(accessToken);
        const matchingKey = updatedKeys.find((k) =>
          key.startsWith(k.key.split("...")[0])
        );
        if (matchingKey) {
          setFullKeys((prev) => {
            const updated = { ...prev, [matchingKey.id]: key };
            saveFullKeysToStorage(updated);
            return updated;
          });
        }
      }
      showNotification("success", "API key created successfully");
    } catch (error) {
      console.error("Failed to create API key:", error);
      showNotification("error", "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteApiKey = (id: string) => {
    setKeyToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteApiKey = async () => {
    if (!keyToDelete) return;

    try {
      setDeletingId(keyToDelete);
      if (!accessToken) throw new Error("No access token");
      await deleteApiKey(accessToken, keyToDelete);

      setFullKeys((prev) => {
        const updated = { ...prev };
        delete updated[keyToDelete];
        saveFullKeysToStorage(updated);
        return updated;
      });
      await fetchApiKeys();
      showNotification("success", "API key deleted successfully");
    } catch (error) {
      console.error("Failed to delete API key:", error);
      showNotification("error", "Failed to delete API key");
    } finally {
      setDeletingId(null);
      setKeyToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const copyToClipboard = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
      showNotification("success", "Copied to clipboard");
    } catch {
      showNotification("error", "Failed to copy to clipboard");
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchApiKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`fixed right-4 sm:right-6 left-4 sm:left-auto top-20 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            notification.type === "success"
              ? "border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-[#8B5CF6]/10 p-2">
            <SettingsIcon className="h-6 w-6 text-[#8B5CF6]" />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#E0E7FF]">
            Settings
          </h2>
        </div>
        <p className="mt-1 text-[#E0E7FF]/50">
          Manage your account settings and API keys
        </p>
      </div>

      {/* Account Info */}
      <div className="rounded-lg border border-white/10 bg-[#ffffff0d]">
        <div className="border-b border-white/10 px-4 sm:px-6 py-4">
          <h3 className="text-lg font-medium text-[#E0E7FF]">
            Account Information
          </h3>
          <p className="mt-0.5 text-sm text-[#E0E7FF]/40">
            Your account details
          </p>
        </div>
        <div className="divide-y divide-white/5 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-4">
            <span className="text-sm font-medium text-[#E0E7FF]/50">
              Wallet Address
            </span>
            <code className="rounded border border-white/10 bg-white/5 px-3 py-1 font-mono text-sm text-[#E0E7FF] truncate">
              {user?.walletAddress
                ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`
                : "Not connected"}
            </code>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-4">
            <span className="text-sm font-medium text-[#E0E7FF]/50 shrink-0">
              DID Identifier
            </span>
            <code className="max-w-full sm:max-w-xs truncate rounded border border-white/10 bg-white/5 px-3 py-1 font-mono text-sm text-[#E0E7FF]">
              {user?.didIdentifier || "N/A"}
            </code>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-4">
            <span className="text-sm font-medium text-[#E0E7FF]/50">
              Account Status
            </span>
            <Badge variant="active">Active</Badge>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="rounded-lg border border-white/10 bg-[#ffffff0d]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-4 sm:px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-medium text-[#E0E7FF]">
              <Key className="h-5 w-5 text-[#8B5CF6]" />
              API Keys
            </h3>
            <p className="mt-0.5 text-sm text-[#E0E7FF]/40">
              Manage your API keys for programmatic access
            </p>
          </div>
          <button
            onClick={handleCreateApiKey}
            disabled={creating}
            className="flex cursor-pointer items-center gap-2 rounded bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create API Key
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-4 sm:p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-4 sm:p-8 text-center">
            <Key className="mx-auto mb-4 h-12 w-12 text-[#E0E7FF]/20" />
            <h3 className="text-lg font-medium text-[#E0E7FF]/60">
              No API keys found
            </h3>
            <p className="mt-1 mb-4 text-sm text-[#E0E7FF]/30">
              Create your first API key to get started with programmatic access
            </p>
            <button
              onClick={handleCreateApiKey}
              disabled={creating}
              className="cursor-pointer rounded bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="mr-2 inline h-4 w-4" />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              headers={["API Key", "Created", "Last Updated", "Actions"]}
            >
              {apiKeys.map((apiKey) => (
                <tr
                  key={apiKey.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td>
                    <code className="break-all rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-[#E0E7FF]">
                      {fullKeys[apiKey.id] || apiKey.key}
                    </code>
                    {!fullKeys[apiKey.id] && (
                      <span className="mt-1 block text-xs text-yellow-400/60">
                        Masked - full key shown only at creation
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="text-sm text-[#E0E7FF]/50 whitespace-nowrap">
                      {formatDate(apiKey.createdAt)}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-[#E0E7FF]/50 whitespace-nowrap">
                      {formatDate(apiKey.updatedAt)}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      {fullKeys[apiKey.id] && (
                        <button
                          onClick={() =>
                            copyToClipboard(fullKeys[apiKey.id], apiKey.id)
                          }
                          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded border border-[#8B5CF6]/20 bg-transparent px-3 py-1.5 text-xs text-[#8B5CF6] transition-colors hover:bg-[#8B5CF6]/10"
                        >
                          {copiedId === apiKey.id ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => confirmDeleteApiKey(apiKey.id)}
                        disabled={deletingId === apiKey.id}
                        className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded border border-red-500/20 bg-transparent px-2 py-1.5 text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === apiKey.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>

      {/* New API Key Dialog */}
      <Dialog
        open={showNewKeyDialog}
        onClose={() => {
          setShowNewKeyDialog(false);
          setNewApiKey(null);
        }}
        title="API Key Created Successfully"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="mb-1 text-sm font-medium text-yellow-400">
              Important: Save this API key now
            </p>
            <p className="text-xs text-yellow-400/70">
              This is the only time you'll see the full API key. Make sure to
              copy and store it securely.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#E0E7FF]/70">
              Your API Key:
            </label>
            <div className="flex gap-2">
              <Input value={newApiKey || ""} readOnly className="flex-1" />
              <button
                onClick={() => copyToClipboard(newApiKey || "")}
                className="cursor-pointer rounded bg-[#8B5CF6] px-3 py-2 text-white transition-opacity hover:opacity-90"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setShowNewKeyDialog(false);
                setNewApiKey(null);
              }}
              className="cursor-pointer rounded bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              I've saved my API key
            </button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete API Key?"
      >
        <p className="text-sm text-[#E0E7FF]/60">
          Are you sure you want to delete this API key? This action cannot be
          undone and any applications using this key will lose access
          immediately.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteDialog(false)}
            className="cursor-pointer rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#E0E7FF] transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteApiKey}
            className="cursor-pointer rounded bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
          >
            Delete API Key
          </button>
        </div>
      </Dialog>
    </div>
  );
}
