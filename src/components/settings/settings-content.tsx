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
          Parametres du compte
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gerez votre mot de passe et surveillez les appareils connectes a votre
          compte.
        </p>
      </header>

      <div className="grid gap-6">
        <PasswordCard />
        <SessionsCard currentSessionToken={currentToken} />
      </div>
    </div>
  );
}
