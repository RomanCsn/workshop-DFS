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
    console.error("Failed to fetch horse", error);
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
          <Link href="/dashboard/horses">Back to horses</Link>
        </Button>

        {!user ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Sign in to view horse details.
          </div>
        ) : !isOwner ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Horse details are only available to stable owners.
          </div>
        ) : !horse ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            We couldn&apos;t find that horse. Try returning to the list and selecting another one.
          </div>
        ) : (
          <Card className="border-muted-foreground/10 shadow-md">
            <CardHeader className="space-y-3">
              <div>
                <CardTitle className="text-3xl font-semibold">
                  {horse.name ?? "Unnamed horse"}
                </CardTitle>
                <CardDescription>{formatText(horse.discipline)}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-3 py-1">
                  Color: {formatText(horse.color)}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  Age: {formatMetric(horse.ageYears, "yrs")}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  Height: {formatMetric(horse.heightCm, "cm")}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  Weight: {formatMetric(horse.weightKg, "kg")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 text-sm">
              {horse.description ? (
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Stable notes
                  </span>
                  <p className="rounded-lg border border-muted-foreground/20 bg-muted/40 p-4 leading-relaxed text-foreground">
                    {horse.description}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-muted-foreground">
                  No description yet. Add one to keep the team aligned.
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-muted-foreground/20 bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Owner ID
                  </p>
                  <p className="mt-1 font-medium text-foreground">{horse.ownerId}</p>
                </div>
                <div className="rounded-lg border border-muted-foreground/20 bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Horse ID
                  </p>
                  <p className="mt-1 font-medium text-foreground">{horse.id}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/dashboard/horses/${horse.id}/edit`}>Edit horse</Link>
              </Button>
              <DeleteHorseButton horseId={horse.id} />
              <Button asChild>
                <Link href="/dashboard/horses">Back to list</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}
