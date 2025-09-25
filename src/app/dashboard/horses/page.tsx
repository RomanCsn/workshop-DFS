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
import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";

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

type HorseListResponse = {
  success: boolean;
  data?: HorseApiResponse[];
  error?: string;
};

async function fetchHorses(ownerId: string): Promise<HorseApiResponse[] | null> {
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

    const payload = (await response.json()) as HorseListResponse;
    if (!payload.success || !payload.data) {
      return null;
    }

    return payload.data;
  } catch (error) {
    console.error("Impossible de recuperer les chevaux", error);
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

export default async function HorsesPage() {
  const user = await getCurrentUser();
  const isOwner = user?.role === "OWNER";
  const horses = isOwner && user?.id ? await fetchHorses(user.id) : null;

  return (
    <Dashboard user={user}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Chevaux</h1>
            <p className="text-sm text-muted-foreground">
              Gardez un oeil sur les chevaux dont vous avez la charge.
            </p>
          </div>
          {isOwner ? (
            <Button asChild>
              <Link href="/dashboard/horses/create">Ajouter un cheval</Link>
            </Button>
          ) : null}
        </div>

        {!user ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Connectez-vous pour voir vos chevaux.
          </div>
        ) : !isOwner ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Les chevaux sont reserves aux proprietaires d'ecurie.
          </div>
        ) : horses === null ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Impossible de charger vos chevaux pour le moment. Merci de reessayer plus tard.
          </div>
        ) : horses.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Vous n'avez pas encore de cheval. Creez-en un pour commencer.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {horses.map((horse) => {
              const preview = formatText(horse.description);

              return (
                <Card key={horse.id} className="flex flex-col gap-2 border-muted-foreground/10 shadow-sm transition hover:shadow-md">
                  <CardHeader className="space-y-3">
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        {horse.name ?? "Cheval sans nom"}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {formatText(horse.discipline)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-1">
                        Couleur : {formatText(horse.color)}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        Age : {formatMetric(horse.ageYears, "ans")}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        Taille : {formatMetric(horse.heightCm, "cm")}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        Poids : {formatMetric(horse.weightKg, "kg")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 text-sm text-muted-foreground">
                    <p className="line-clamp-3 leading-relaxed">
                      {preview !== "—" ? preview : "Pas encore de description."}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/horses/${horse.id}`}>Voir</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/dashboard/horses/${horse.id}/edit`}>Modifier</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Dashboard>
  );
}
