import { DeveloperGate } from "@/components/dashboard/developer-gate";
import { N8nNav } from "@/components/dashboard/n8n/ui";

// The parent dashboard layout already redirects signed-out users (M4.4).
export default function N8nLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeveloperGate>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>n8n</h1>
            <p>Publish n8n workflows as paid agents, and call other agents from them</p>
          </div>
        </div>
        <N8nNav />
        {children}
      </div>
    </DeveloperGate>
  );
}
