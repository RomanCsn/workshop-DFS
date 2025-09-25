import Link from "next/link";
import { headers } from "next/headers";

import { HorseForm, type HorseRecord } from "@/components/horses/horse-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";

type EditHorsePageProps = {
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

    const horse = payload.data.find((entry) => entry.id === horseId) ?? null;
    return horse as HorseRecord | null;
  } catch (error) {
    console.error("Failed to fetch horse", error);
    return null;
  }
}

export default async function EditHorsePage({ params }: EditHorsePageProps) {
  const user = await getCurrentUser();
  const isOwner = user?.role === "OWNER";
  const horse = isOwner && user?.id ? await fetchHorse(user.id, params.id) : null;

  return (
    <Dashboard user={user}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Edit horse</h1>
            <p className="text-sm text-muted-foreground">
              Update measurements and notes to keep everyone aligned.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/dashboard/horses/${params.id}`}>Back to details</Link>
          </Button>
        </div>

        {!user ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            You need to be signed in to edit a horse.
          </p>
        ) : !isOwner ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Only stable owners can update horse information.
          </p>
        ) : !horse ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            We couldn&apos;t find that horse. Try going back to the list and selecting another one.
          </p>
        ) : (
          <Card className="border-muted-foreground/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Horse profile</CardTitle>
              <CardDescription>
                Adjust measurements or refresh the summary so everyone has the latest info.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HorseForm
                ownerId={user.id}
                horseId={horse.id}
                initialHorse={horse}
                redirectTo={`/dashboard/horses/${horse.id}`}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}
