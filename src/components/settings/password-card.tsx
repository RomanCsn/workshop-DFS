"use client";

import { useMemo } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { changePasswordAction } from "@/app/dashboard/settings/actions";
import type { PasswordActionState } from "@/app/dashboard/settings/contracts";
import { PASSWORD_INITIAL_STATE } from "@/app/dashboard/settings/contracts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordCard() {
  const initialState = useMemo<PasswordActionState>(
    () => ({ ...PASSWORD_INITIAL_STATE }),
    [],
  );
  const [state, formAction] = useFormState(changePasswordAction, initialState);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Modifier le mot de passe</CardTitle>
        <CardDescription>
          Renforcez la securite de votre compte avec un nouveau mot de passe. La
          deconnexion des autres sessions est facultative mais recommandee apres
          une modification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(state.fieldErrors?.currentPassword)}
            />
            {state.fieldErrors?.currentPassword ? (
              <p className="text-sm text-destructive">
                {state.fieldErrors.currentPassword}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(state.fieldErrors?.newPassword)}
              />
              {state.fieldErrors?.newPassword ? (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.newPassword}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              />
              {state.fieldErrors?.confirmPassword ? (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="revokeOtherSessions"
              className="border-input focus-visible:ring-ring/50 h-4 w-4 rounded border shadow-sm transition focus-visible:outline-none focus-visible:ring-[3px]"
            />
            <span className="text-muted-foreground">
              Me deconnecter des autres appareils apres avoir change mon mot de passe
            </span>
          </label>
          <div className="flex items-center justify-between gap-4">
            {state.message ? (
              <p
                className={`text-sm ${state.status === "success" ? "text-emerald-600 dark:text-emerald-500" : "text-destructive"}`}
              >
                {state.message}
              </p>
            ) : (
              <span className="text-sm text-muted-foreground">
                Utilisez au moins 8 caracteres avec un melange de chiffres et de symboles.
              </span>
            )}
            <SubmitButton status={state.status} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton({ status }: { status: PasswordActionState["status"] }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement..." : status === "success" ? "Enregistre" : "Enregistrer"}
    </Button>
  );
}
