import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteHorseButton } from "@/components/horses/delete-horse-button";
import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";

type HorseDetailPageProps = {
  params: { id: string };
};

type HorseApiResponse = {
  id: string;
  ownerId: string;
  name: string | null;
  description: string | null;
  color: string | null;
  discipline: string | null;
  ageYears: number | null;
  heightCm: number | null;
  weightKg: number | null;
};

async function fetchHorse(ownerId: string, horseId: string) {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host = headersList.get("host") ?? "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  try {
    const response = await fetch(
      `${baseUrl}/api/horse?ownerId=${encodeURIComponent(ownerId)}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      success: boolean;
      data?: HorseApiResponse[];
    };

    if (!payload.success || !payload.data) {
      return null;
    }

    return payload.data.find((entry) => entry.id === horseId) ?? null;
  } catch (error) {
    console.error("Impossible de recuperer le cheval", error);
    return null;
  }
}

function formatMetric(value: number | null, suffix: string) {
  if (value === null || value === undefined) return "—";
  return `${value} ${suffix}`;
}

function formatText(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export default async function HorseDetailPage({ params }: HorseDetailPageProps) {
  const user = await getCurrentUser();
  const isOwner = user?.role === "OWNER";
  const horse = isOwner && user?.id ? await fetchHorse(user.id, params.id) : null;

  return (
    <Dashboard user={user}>
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href="/dashboard/horses">Retour aux chevaux</Link>
        </Button>

        {!user ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Connectez-vous pour voir les details du cheval.
          </div>
        ) : !isOwner ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Les details des chevaux sont reserves aux proprietaires d'ecurie.
          </div>
        ) : !horse ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ce cheval est introuvable. Revenez a la liste et selectionnez-en un autre.
          </div>
        ) : (
          <Card className="border-muted-foreground/10 shadow-md">
            <CardHeader className="space-y-3">
              <div>
                <CardTitle className="text-3xl font-semibold">
                  {horse.name ?? "Cheval sans nom"}
                </CardTitle>
                <CardDescription>{formatText(horse.discipline)}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-3 py-1">
                  Couleur : {formatText(horse.color)}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  Age : {formatMetric(horse.ageYears, "ans")}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  Taille : {formatMetric(horse.heightCm, "cm")}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  Poids : {formatMetric(horse.weightKg, "kg")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 text-sm">
              {horse.description ? (
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Notes d'ecurie
                  </span>
                  <p className="rounded-lg border border-muted-foreground/20 bg-muted/40 p-4 leading-relaxed text-foreground">
                    {horse.description}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-muted-foreground">
                  Pas encore de description. Ajoutez-en une pour informer l'equipe.
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-muted-foreground/20 bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    ID proprietaire
                  </p>
                  <p className="mt-1 font-medium text-foreground">{horse.ownerId}</p>
                </div>
                <div className="rounded-lg border border-muted-foreground/20 bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    ID cheval
                  </p>
                  <p className="mt-1 font-medium text-foreground">{horse.id}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/dashboard/horses/${horse.id}/edit`}>Modifier le cheval</Link>
              </Button>
              <DeleteHorseButton horseId={horse.id} />
              <Button asChild>
                <Link href="/dashboard/horses">Retour a la liste</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}
