import Link from "next/link";
import { ListingsTable } from "@/components/dashboard/n8n/listings";

export default function N8nListingsPage() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <Link href="/dashboard/n8n/listings/new" className="dashboard-button" style={{ textDecoration: "none" }}>New listing</Link>
      </div>
      <ListingsTable />
    </>
  );
}
