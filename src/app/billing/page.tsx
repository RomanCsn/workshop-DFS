import AllBillings from "@/components/billing/allBillings";
import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";

export default async function Page() {
  const session = await getCurrentUser();
  const userId = session?.id ?? "User not found";
  return (
    <Dashboard user={session}>
      <AllBillings userId={userId} />
    </Dashboard>
  );
}