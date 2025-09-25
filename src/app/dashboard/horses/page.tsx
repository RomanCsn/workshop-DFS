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
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {horses.map((horse) => {
              const preview = formatText(horse.description);

              return (
                <Card key={horse.id} className="flex flex-col gap-2 border-muted-foreground/10 shadow-sm transition hover:shadow-md">
                  <CardHeader className="space-y-3">
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        {horse.name ?? "Unnamed horse"}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {formatText(horse.discipline)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-1">
                        Color: {formatText(horse.color)}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        Age: {formatMetric(horse.ageYears, "yrs")}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        Height: {formatMetric(horse.heightCm, "cm")}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        Weight: {formatMetric(horse.weightKg, "kg")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 text-sm text-muted-foreground">
                    <p className="line-clamp-3 leading-relaxed">
                      {preview !== "—" ? preview : "No description yet."}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/horses/${horse.id}`}>View</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/dashboard/horses/${horse.id}/edit`}>Edit</Link>
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
