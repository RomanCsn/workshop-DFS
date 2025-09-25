"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = (form.get("email") || "").toString().trim().toLowerCase();
    const password = (form.get("password") || "").toString();

    async function signIn() {
      try {
        setIsSubmitting(true);
        const response = await authClient.signIn.email({
          email,
          password,
        });

        if (response.error) {
          setError(response.error.message ?? "Email ou mot de passe invalide.");
          return;
        }

        router.push("/dashboard");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Connexion impossible. Merci de reessayer.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }

    void signIn();
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Connectez-vous a votre compte</CardTitle>
          <CardDescription>
            Saisissez votre email ci-dessous pour acceder a votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  name="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublie ?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
          {isSubmitting ? "Connexion..." : "Connexion"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Pas encore de compte ?{" "}
              <a href="/signup" className="underline underline-offset-4">
                Inscription
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
