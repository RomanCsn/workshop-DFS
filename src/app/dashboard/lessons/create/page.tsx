import Link from "next/link";

import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { LessonsForm } from "@/components/lessons/lessons-form";

export default async function CreateLessonsPage() {
  const user = await getCurrentUser();

  return (
    <Dashboard user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Ajouter une lecon</h1>
            <p className="text-sm text-muted-foreground">
              Planifiez une nouvelle lecon pour vos cavaliers.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/lessons">Retour aux lecons</Link>
          </Button>
        </div>
        <LessonsForm />
      </div>
    </Dashboard>
  );
}
