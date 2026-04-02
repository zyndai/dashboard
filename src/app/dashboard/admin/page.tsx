"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Users, Bot, Globe, Search } from "lucide-react";

interface AdminUser {
  id: string;
  userId: string;
  developerId: string;
  name: string;
  username: string | null;
  email: string;
  role: string;
  country: string;
  agentCount: number;
  createdAt: string;
}

export default function AdminPage() {
  const { authenticated } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authenticated) return;

    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        if (res.status === 403) {
          setError("You do not have admin access.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError("Failed to load users.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [authenticated]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username ?? "").toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const totalAgents = users.reduce((sum, u) => sum + u.agentCount, 0);
  const countries = new Set(users.map((u) => u.country).filter((c) => c !== "—"));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-500/5 p-8 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Admin Panel
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Overview of all registered users and their activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-px sm:grid-cols-3 border border-white/10 bg-white/10">
        <StatCard
          icon={<Users className="h-4 w-4 text-[var(--color-accent)]" />}
          label="Total Users"
          value={total.toString()}
        />
        <StatCard
          icon={<Bot className="h-4 w-4 text-[var(--color-accent)]" />}
          label="Total Agents"
          value={totalAgents.toString()}
        />
        <StatCard
          icon={<Globe className="h-4 w-4 text-[var(--color-accent)]" />}
          label="Countries"
          value={countries.size.toString()}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search by name, email, username, country, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-white/10 bg-white/[0.02] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[var(--color-accent)]/50 transition-colors"
        />
      </div>

      {/* Users Table */}
      <div className="border border-white/10 bg-white/[0.02]">
        <Table
          headers={[
            "User",
            "Email",
            "Username",
            "Role",
            "Country",
            "Agents",
            "Registered",
          ]}
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-white/30">
                {search ? "No users match your search." : "No users found."}
              </td>
            </tr>
          ) : (
            filtered.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-white/30 font-mono">
                    {user.developerId.slice(0, 12)}...
                  </div>
                </td>
                <td className="text-sm text-white/70">{user.email}</td>
                <td className="text-sm font-mono text-white/70">
                  {user.username ?? "—"}
                </td>
                <td>
                  <Badge variant="default">{user.role}</Badge>
                </td>
                <td className="text-sm text-white/70">{user.country}</td>
                <td>
                  <span
                    className={`text-sm font-bold ${
                      user.agentCount > 0
                        ? "text-[var(--color-accent)]"
                        : "text-white/30"
                    }`}
                  >
                    {user.agentCount}
                  </span>
                </td>
                <td className="text-xs text-white/40">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))
          )}
        </Table>
      </div>

      {/* Footer count */}
      <p className="text-xs text-white/30">
        Showing {filtered.length} of {total} users
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#0a0a0a] p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded border border-white/10 bg-white/5">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-white/40">
          {label}
        </div>
        <div className="truncate text-sm font-bold text-white">{value}</div>
      </div>
    </div>
  );
}
