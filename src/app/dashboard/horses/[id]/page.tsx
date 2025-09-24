import Link from "next/link";

import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const horses = [
  {
    id: "1",
    name: "Hidalgo",
    breed: "Mustang",
    discipline: "Endurance",
    notes: "Prefers early morning sessions and longer trail rides.",
  },
  {
    id: "2",
    name: "Shadowfax",
    breed: "Lusitano",
    discipline: "Dressage",
    notes: "Responsive to voice commands and works well with experienced riders.",
  },
  {
    id: "3",
    name: "Juniper",
    breed: "Quarter Horse",
    discipline: "Reining",
    notes: "Still green on spins but progressing fast with consistent training.",
  },
];

type HorseDetailPageProps = {
  params: { id: string };
};

export default async function HorseDetailPage({ params }: HorseDetailPageProps) {
  const user = await getCurrentUser();
  const horse = horses.find((entry) => entry.id === params.id);

  return (
    <Dashboard user={user}>
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href="/dashboard/horses">Back to horses</Link>
        </Button>

        {horse ? (
          <Card>
            <CardHeader>
              <CardTitle>{horse.name}</CardTitle>
              <CardDescription>
                {horse.breed ? horse.breed : "Breed not specified"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Discipline:</span>{" "}
                <span>{horse.discipline || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Identifier:</span>{" "}
                <span>#{horse.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1 leading-relaxed">
                  {horse.notes || "No notes recorded yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            We could not find that horse. Try returning to the list and selecting another one.
          </div>
        )}
      </div>
    </Dashboard>
  );
}
