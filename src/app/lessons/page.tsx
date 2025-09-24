import Dashboard from "@/layouts/dashboard";
import { SettingsContent } from "@/components/settings/settings-content";
import { getCurrentSession } from "@/lib/session";
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LessonsPage() {
  const session = await getCurrentSession();
 

  return (
    <Dashboard urse={{session}} >
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Lessons</h1>
            <p className="text-sm text-muted-foreground">
              text
            </p>
          </div>
          <Button asChild>
            <Link href="/lessons/create">Add lessons</Link>
          </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            Liste of lessons 

          </div>
        </div>

      
   </Dashboard> 
  );

}
