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
    console.error("Failed to fetch horses", error);
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
            <h1 className="text-2xl font-semibold">Horses</h1>
            <p className="text-sm text-muted-foreground">
              Keep an eye on the horses under your care.
            </p>
          </div>
          {isOwner ? (
            <Button asChild>
              <Link href="/dashboard/horses/create">Add horse</Link>
            </Button>
          ) : null}
        </div>

        {!user ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Sign in to view your horses.
          </div>
        ) : !isOwner ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Horses are only available to stable owners.
          </div>
        ) : horses === null ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            We couldn&apos;t load your horses right now. Please try again later.
          </div>
        ) : horses.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            You don&apos;t have any horses yet. Create one to get started.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {horses.map((horse) => (
              <Card key={horse.id}>
                <CardHeader>
                  <CardTitle>{horse.name ?? "Unnamed horse"}</CardTitle>
                  <CardDescription>
                    {formatText(horse.discipline)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Color:</span>{" "}
                    <span>{formatText(horse.color)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Age:</span>{" "}
                    <span>{formatMetric(horse.ageYears, "years")}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Height:</span>{" "}
                    <span>{formatMetric(horse.heightCm, "cm")}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Weight:</span>{" "}
                    <span>{formatMetric(horse.weightKg, "kg")}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/horses/${horse.id}`}>View details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Dashboard>
  );
}
