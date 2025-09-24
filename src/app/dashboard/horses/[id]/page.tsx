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
          <Card>
            <CardHeader>
              <CardTitle>{horse.name ?? "Unnamed horse"}</CardTitle>
              <CardDescription>{formatText(horse.discipline)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Color</span>
                  <span className="font-medium text-foreground">
                    {formatText(horse.color)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium text-foreground">
                    {formatMetric(horse.ageYears, "years")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium text-foreground">
                    {formatMetric(horse.heightCm, "cm")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium text-foreground">
                    {formatMetric(horse.weightKg, "kg")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Owner ID</span>
                  <span className="font-medium text-foreground">{horse.ownerId}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Horse ID</span>
                  <span className="font-medium text-foreground">{horse.id}</span>
                </div>
              </div>

              {horse.description ? (
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground">Description</span>
                  <p className="whitespace-pre-line text-foreground">
                    {horse.description}
                  </p>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/dashboard/horses/${horse.id}/edit`}>Edit horse</Link>
              </Button>
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
