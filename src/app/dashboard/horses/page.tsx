import Link from "next/link";

import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const horses = [
  {
    id: "1",
    name: "Hidalgo",
    breed: "Mustang",
    discipline: "Endurance",
  },
  {
    id: "2",
    name: "Shadowfax",
    breed: "Lusitano",
    discipline: "Dressage",
  },
  {
    id: "3",
    name: "Juniper",
    breed: "Quarter Horse",
    discipline: "Reining",
  },
];

export default async function HorsesPage() {
  const user = await getCurrentUser();

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
          <Button asChild>
            <Link href="/dashboard/horses/create">Add horse</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {horses.map((horse) => (
            <Card key={horse.id}>
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
                  <span className="text-muted-foreground">ID:</span>{" "}
                  <span>#{horse.id}</span>
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
      </div>
    </Dashboard>
  );
}
