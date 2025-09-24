import Dashboard from "@/layouts/dashboard";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getCurrentSession } from "@/lib/session";

export default async function Page() {
  const session = await getCurrentSession();
  const user = session?.user ?? null;

  return (
    <Dashboard user={user}>
    </Dashboard>
  );
}
