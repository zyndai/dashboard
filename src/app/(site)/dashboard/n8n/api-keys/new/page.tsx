import { ApiKeyForm } from "@/components/dashboard/n8n/api-keys";

export default function NewN8nApiKeyPage() {
  return (
    <>
      <h2 style={{ marginTop: 0 }}>New API key</h2>
      <ApiKeyForm />
    </>
  );
}
