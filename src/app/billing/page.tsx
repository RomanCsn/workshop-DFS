import AllBillings from "@/components/billing/allBillings";
import { getCurrentUser } from "@/lib/session";

export default async function Page() {
  const session = await getCurrentUser();
  const userId = session?.id ?? "User not found";
  return (
    <>
      <AllBillings userId={userId} />
    </>
  );
}