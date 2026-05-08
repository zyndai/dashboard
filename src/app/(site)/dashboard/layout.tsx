import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/auth/server";
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, needsOnboarding } = await getServerAuth();

  if (!user) {
    redirect("/auth");
  }
  if (needsOnboarding) {
    redirect("/onboard/setup");
  }

  return <DashboardChrome>{children}</DashboardChrome>;
}
