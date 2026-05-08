import { redirect } from "next/navigation";
import { isZyndAdmin } from "@/lib/admin-zynd-auth";

export const dynamic = "force-dynamic";

export default async function AdminZyndIndex() {
  if (await isZyndAdmin()) redirect("/admin-zynd/users");
  // Layout shows login form when not authed.
  return null;
}
