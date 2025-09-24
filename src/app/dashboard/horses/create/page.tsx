import Link from "next/link";

import { HorseForm } from "@/components/horses/horse-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";

export default async function CreateHorsePage() {
  const user = await getCurrentUser();
  const isOwner = user?.role === "OWNER";

  return (
    <Dashboard user={user}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Add a horse</h1>
            <p className="text-sm text-muted-foreground">
              Create a new horse profile for your stable.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/horses">Back to horses</Link>
          </Button>
        </div>

        {!user ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            You need to be signed in to add a horse.
          </p>
        ) : !isOwner ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Only stable owners can create horses.
          </p>
        ) : (
          <Card className="border-muted-foreground/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Horse profile</CardTitle>
              <CardDescription>
                Give your horse a name and fill the key details to keep its profile fresh.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HorseForm ownerId={user.id} redirectTo="/dashboard/horses" />
            </CardContent>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}
