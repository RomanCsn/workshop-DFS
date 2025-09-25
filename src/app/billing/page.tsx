import AllBillingsUser from "@/components/billing/allBillingsUser";
import AllBillings from "@/components/billing/allBillings";
import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";

export default async function Page() {
  const session = await getCurrentUser();

  return (
    <Dashboard user={session}>
      {session?.role === 'ADMIN' ? (
        <AllBillings />
      ) : (
        <AllBillingsUser userId={session?.id} />
      )}
    </Dashboard>
  );
}

//dashboard route
//Route Sidebar
