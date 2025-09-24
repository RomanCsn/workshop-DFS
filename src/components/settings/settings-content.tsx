import type { getCurrentSession } from "@/lib/session";

import { PasswordCard } from "./password-card";
import { SessionsCard } from "./sessions-card";

type SettingsContentProps = {
  session: Awaited<ReturnType<typeof getCurrentSession>>;
};

export function SettingsContent({ session }: SettingsContentProps) {
  const currentToken = session?.session?.token ?? null;

  return (
    <div className="grid max-w-4xl gap-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Account settings
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your password and keep an eye on devices that are signed in to
          your account.
        </p>
      </header>

      <div className="grid gap-6">
        <PasswordCard />
        <SessionsCard currentSessionToken={currentToken} />
      </div>
    </div>
  );
}
