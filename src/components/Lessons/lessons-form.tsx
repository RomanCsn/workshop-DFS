"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type LessonsFormValues = {
  date: string;
  desc: string;
  status: "PENDING" | "IN_PROGRESS" | "FINISHED";
  monitorId: string;
  customerId: string;
  horseId: string;
  amount: string;
};

type LessonsFormProps = {
  onSubmit?: (values: LessonsFormValues) => void;
};

type HorseOption = {
  id: string;
  name?: string | null;
};

type UserOption = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

const emptyValues: LessonsFormValues = {
  date: "",
  desc: "",
  status: "PENDING",
  monitorId: "",
  customerId: "",
  horseId: "",
  amount: "",
};

const statusOptions: Array<{ value: LessonsFormValues["status"]; label: string }> = [
  { value: "PENDING", label: "En attente" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "FINISHED", label: "Terminee" },
];

const extractApiError = async (response: Response) => {
  try {
    const payload = await response.json();
    if (payload?.error) return String(payload.error);
    if (payload?.message) return String(payload.message);
  } catch {
    // Ignore JSON parse errors and fall back to status text
  }
  return response.statusText || "Echec de la requete";
};

const formatUserLabel = (user: UserOption) => {
  const names = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (names) return names;
  if (user.email) return user.email;
  return `Utilisateur ${user.id.slice(0, 8)}`;
};

export function LessonsForm({ onSubmit }: LessonsFormProps) {
  const router = useRouter();

  const [values, setValues] = React.useState<LessonsFormValues>(emptyValues);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [horses, setHorses] = React.useState<HorseOption[]>([]);
  const [horseError, setHorseError] = React.useState<string | null>(null);
  const [horseLoading, setHorseLoading] = React.useState(true);
  const [monitorOptions, setMonitorOptions] = React.useState<UserOption[]>([]);
  const [customerOptions, setCustomerOptions] = React.useState<UserOption[]>([]);
  const [userError, setUserError] = React.useState<string | null>(null);
  const [userLoading, setUserLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchHorses = async () => {
      try {
        const response = await fetch("/api/horse", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Impossible de charger les chevaux (statut ${response.status})`);
        }
        const payload = await response.json();
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setHorses(list);
        setHorseError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Echec du chargement des chevaux.";
        setHorseError(message);
        setHorses([]);
      } finally {
        if (!controller.signal.aborted) {
          setHorseLoading(false);
        }
      }
    };

    fetchHorses();

    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const [monitorsResponse, customersResponse] = await Promise.all([
          fetch("/api/user?role=MONITOR&take=100", {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch("/api/user?role=CUSTOMER&take=100", {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);

        if (!monitorsResponse.ok) {
          throw new Error(`Impossible de charger les moniteurs (statut ${monitorsResponse.status})`);
        }

        if (!customersResponse.ok) {
          throw new Error(`Impossible de charger les clients (statut ${customersResponse.status})`);
        }

        const monitorsPayload = await monitorsResponse.json();
        const customersPayload = await customersResponse.json();

        const monitors = Array.isArray(monitorsPayload?.data) ? monitorsPayload.data : [];
        const customers = Array.isArray(customersPayload?.data) ? customersPayload.data : [];

        setMonitorOptions(monitors);
        setCustomerOptions(customers);
        setUserError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Echec du chargement des utilisateurs.";
        setUserError(message);
        setMonitorOptions([]);
        setCustomerOptions([]);
      } finally {
        if (!controller.signal.aborted) {
          setUserLoading(false);
        }
      }
    };

    fetchUsers();

    return () => controller.abort();
  }, []);

  const handleChange =
    (field: keyof LessonsFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((previous) => ({ ...previous, [field]: event.target.value }));
      setSuccessMessage(null);
      setErrorMessage(null);
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!values.horseId) {
      setErrorMessage("Veuillez selectionner un cheval pour cette lecon.");
      setIsSubmitting(false);
      return;
    }

    if (!values.monitorId) {
      setErrorMessage("Veuillez selectionner un moniteur pour cette lecon.");
      setIsSubmitting(false);
      return;
    }

    if (!values.customerId) {
      setErrorMessage("Veuillez selectionner un client pour cette lecon.");
      setIsSubmitting(false);
      return;
    }

    const parsedDate = new Date(values.date);
    if (!values.date || Number.isNaN(parsedDate.getTime())) {
      setErrorMessage("Veuillez fournir une date de lecon valide.");
      setIsSubmitting(false);
      return;
    }

    const amountValue = values.amount.trim() ? Number(values.amount) : 0;
    if (Number.isNaN(amountValue) || amountValue < 0) {
      setErrorMessage("Veuillez indiquer un montant valide et positif.");
      setIsSubmitting(false);
      return;
    }

    const lessonPayload = {
      date: parsedDate.toISOString(),
      desc: values.desc,
      status: values.status,
      monitorId: values.monitorId,
      customerId: values.customerId,
      horseId: values.horseId,
    };

    try {
      const lessonResponse = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonPayload),
      });

      if (!lessonResponse.ok) {
        throw new Error(await extractApiError(lessonResponse));
      }

      const lessonResult = await lessonResponse.json();
      const lessonId: string | undefined = lessonResult?.data?.id;

      if (!lessonId) {
        throw new Error("Lecon creee mais identifiant manquant.");
      }

      const serviceResponse = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "LESSON",
          userId: values.customerId,
          serviceId: lessonId,
          amount: amountValue,
        }),
      });

      if (!serviceResponse.ok) {
        const errorText = await extractApiError(serviceResponse);
        await fetch(`/api/lessons?id=${lessonId}`, { method: "DELETE" });
        throw new Error(`Creation de la facturation impossible : ${errorText}`);
      }

      onSubmit?.(values);
      setValues(emptyValues);
      setSuccessMessage("Lecon creee avec succes.");
      router.push("/dashboard/lessons");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Echec de la creation de la lecon.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date et heure</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            value={values.date}
            onChange={handleChange("date")}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={values.status}
            onValueChange={(value) => {
              setValues((previous) => ({ ...previous, status: value as LessonsFormValues["status"] }));
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            disabled={isSubmitting}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Selectionnez un statut" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="monitorId">Moniteur</Label>
          <Select
            value={values.monitorId}
            onValueChange={(value) => {
              setValues((previous) => ({ ...previous, monitorId: value }));
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            disabled={isSubmitting || userLoading || monitorOptions.length === 0}
          >
            <SelectTrigger id="monitorId">
              <SelectValue
                placeholder={
                  userLoading
                    ? "Chargement des moniteurs..."
                    : monitorOptions.length === 0
                      ? "Aucun moniteur disponible"
                      : "Selectionnez un moniteur"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {monitorOptions.map((monitor) => (
                <SelectItem key={monitor.id} value={monitor.id}>
                  {formatUserLabel(monitor)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userError ? (
            <p className="text-sm text-destructive" role="alert">
              {userError}
            </p>
          ) : null}
          {!userError && !userLoading && monitorOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ajoutez un moniteur avant de planifier des lecons.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerId">Client</Label>
          <Select
            value={values.customerId}
            onValueChange={(value) => {
              setValues((previous) => ({ ...previous, customerId: value }));
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            disabled={isSubmitting || userLoading || customerOptions.length === 0}
          >
            <SelectTrigger id="customerId">
              <SelectValue
                placeholder={
                  userLoading
                    ? "Chargement des clients..."
                    : customerOptions.length === 0
                      ? "Aucun client disponible"
                      : "Selectionnez un client"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {customerOptions.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {formatUserLabel(customer)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!userError && !userLoading && customerOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ajoutez un client avant de planifier des lecons.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="horseId">Cheval</Label>
          <Select
            value={values.horseId}
            onValueChange={(value) => {
              setValues((previous) => ({ ...previous, horseId: value }));
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            disabled={isSubmitting || horseLoading || horses.length === 0}
          >
            <SelectTrigger id="horseId">
              <SelectValue
                placeholder={
                  horseLoading
                    ? "Chargement des chevaux..."
                    : horses.length === 0
                      ? "Aucun cheval disponible"
                      : "Selectionnez un cheval"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {horses.map((horse) => (
                <SelectItem key={horse.id} value={horse.id}>
                  {horse.name ?? `Cheval ${horse.id.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {horseError ? (
            <p className="text-sm text-destructive" role="alert">
              {horseError}
            </p>
          ) : null}
          {!horseError && !horseLoading && horses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ajoutez un cheval avant de creer une lecon.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Montant (optionnel)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={values.amount}
            onChange={handleChange("amount")}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="desc">Notes</Label>
        <textarea
          id="desc"
          name="desc"
          placeholder="Objectif de la lecon, objectifs du cavalier, notes supplementaires..."
          value={values.desc}
          onChange={handleChange("desc")}
          required
          disabled={isSubmitting}
          className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </div>
      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            horseLoading ||
            userLoading ||
            horses.length === 0 ||
            monitorOptions.length === 0 ||
            customerOptions.length === 0
          }
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer la lecon"}
        </Button>
        {successMessage ? (
          <span className="text-sm text-muted-foreground">{successMessage}</span>
        ) : null}
      </div>
    </form>
  );
}
