import { Suspense } from "react";
import { ListingDetail } from "@/components/dashboard/n8n/listing-detail";

export default async function N8nListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // useSearchParams needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <ListingDetail id={id} />
    </Suspense>
  );
}
