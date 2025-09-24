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
            <h1 className="text-2xl font-semibold">Add a lessons</h1>
            <p className="text-sm text-muted-foreground">
              text 
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/lessons">Back to Lessons</Link>
          </Button>
        </div>
        <LessonsForm />
      </div>
    </Dashboard>
  );
}
