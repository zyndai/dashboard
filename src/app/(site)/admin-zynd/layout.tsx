import { isZyndAdmin } from "@/lib/admin-zynd-auth";
import { ZyndLoginForm } from "@/components/admin-zynd/login-form";
import { AdminZyndChrome } from "@/components/admin-zynd/admin-zynd-chrome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Zynd Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminZyndLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isZyndAdmin();
  if (!authed) return <ZyndLoginForm />;
  return <AdminZyndChrome>{children}</AdminZyndChrome>;
}
