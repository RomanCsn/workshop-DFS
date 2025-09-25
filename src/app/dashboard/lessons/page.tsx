import Dashboard from "@/layouts/dashboard";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { LessonsList } from "@/components/lessons/lessons-list";

export default async function LessonsPage() {
  const user = await getCurrentUser();

  return (
    <Dashboard user={user}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Lessons</h1>
            <p className="text-sm text-muted-foreground">
              Review your upcoming and past riding lessons.
            </p>
          </div>
          <Button asChild>
            <Link href="/lessons/create">Add lesson</Link>
          </Button>
        </div>
        <LessonsList />
      </div>
    </Dashboard>
  );
}
