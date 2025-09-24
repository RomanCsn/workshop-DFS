import Link from "next/link";

import { HorseForm } from "@/components/horses/horse-form";
import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default async function CreateHorsePage() {
  const user = await getCurrentUser();

  return (
    <Dashboard user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Add a horse</h1>
            <p className="text-sm text-muted-foreground">
              Capture the horse basic information to keep everyone in sync.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/horses">Back to horses</Link>
          </Button>
        </div>
        <HorseForm />
      </div>
    </Dashboard>
  );
}
