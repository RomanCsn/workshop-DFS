import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";
export default async function Page() {
  const session = await getCurrentUser();

  return (
    <Dashboard user={{ session }}>
      <div className="text-2xl font-bold">Welcome to the Dashboard</div>
    </Dashboard>
  );
}
