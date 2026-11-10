import Link from "next/link";
import { ApiKeysTable } from "@/components/dashboard/n8n/api-keys";

export default function N8nApiKeysPage() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <Link href="/dashboard/n8n/api-keys/new" className="dashboard-button" style={{ textDecoration: "none" }}>New API key</Link>
      </div>
      <ApiKeysTable />
    </>
  );
}
