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
            <h1 className="text-2xl font-semibold">Ajouter un cheval</h1>
            <p className="text-sm text-muted-foreground">
              Creez un nouveau profil de cheval pour votre ecurie.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/horses">Retour aux chevaux</Link>
          </Button>
        </div>

        {!user ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Vous devez etre connecte pour ajouter un cheval.
          </p>
        ) : !isOwner ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Seuls les proprietaires d'ecurie peuvent creer des chevaux.
          </p>
        ) : (
          <Card className="border-muted-foreground/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Profil du cheval</CardTitle>
              <CardDescription>
                Donnez un nom a votre cheval et renseignez les informations essentielles pour garder son profil a jour.
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
