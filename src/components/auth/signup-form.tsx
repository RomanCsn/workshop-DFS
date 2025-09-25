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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "OWNER" | "CUSTOMER";

const roleHelp: Record<Role, string> = {
  OWNER: "Vous possedez des chevaux ou une ecurie.",
  CUSTOMER: "Vous reservez des services.",
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [role, setRole] = React.useState<Role | "">("");
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    setSuccess(null);

    if (!role) {
      setError("Veuillez selectionner un role avant de continuer.");
      return;
    }

    const formElement = e.currentTarget;
    const data = new FormData(formElement);
    const firstName = (data.get("firstName") || "").toString().trim();
    const lastName = (data.get("lastName") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim().toLowerCase();
    const phone = (data.get("phone") || "").toString().trim();
    const password = (data.get("password") || "").toString();

    if (!password || password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    if (!firstName || !lastName) {
      setError("Le prenom et le nom sont obligatoires.");
      return;
    }

    async function signUp() {
      try {
        setIsSubmitting(true);

        const response = await authClient.signUp.email({
          email,
          password,
          firstName,
          lastName,
          phone,
          role,
        });

        if (response.error) {
          setError(
            response.error.message ?? "Une erreur est survenue. Merci de reessayer.",
          );
          return;
        }

        setSuccess("Compte cree ! Redirection vers le tableau de bord...");
        formElement.reset();
        setRole("");
        setSubmitted(false);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Creation du compte impossible. Merci de reessayer.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }

    void signUp();
  }

  const help = role
    ? roleHelp[role as Role]
    : "Choisissez le role qui vous correspond le mieux.";

  return (
    <div className={cn("mx-auto w-full max-w-md", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>Tous les champs sont obligatoires.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="firstName">Prenom</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Jane"
                autoComplete="given-name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as Role);
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selectionnez votre role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Proprietaire</SelectItem>
                  <SelectItem value="CUSTOMER">Client</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{help}</p>
              {submitted && !role ? (
                <p className="text-sm text-destructive" role="alert">
                  Veuillez selectionner un role.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telephone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="+33 6 12 34 56 78"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Utilisez au moins 8 caracteres pour securiser votre compte.
              </p>
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="text-sm text-emerald-600" role="status">
                {success}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creation du compte..." : "Creer un compte"}
            </Button>

            <p className="text-center text-sm">
              Vous avez deja un compte ?{" "}
              <a href="/login" className="underline underline-offset-4">
                Connexion
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
