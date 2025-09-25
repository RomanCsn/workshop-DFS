"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type HorseRecord = {
  id: string;
  ownerId: string;
  name: string | null;
  description: string | null;
  color: string | null;
  discipline: string | null;
  ageYears: number | null;
  heightCm: number | null;
  weightKg: number | null;
};

type HorseFormValues = {
  name: string;
  description: string;
  color: string;
  discipline: string;
  ageYears: string;
  heightCm: string;
  weightKg: string;
};

type HorseFormProps = {
  ownerId: string;
  horseId?: string;
  redirectTo?: string;
  initialHorse?: HorseRecord | null;
  onSuccess?: (horse: HorseRecord) => void;
};

type FormStatus = "idle" | "saving" | "success" | "error";

function extractServerError(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const message = extractServerError(entry);
      if (message) return message;
    }
    return null;
  }

  if (typeof value === "object") {
    for (const entry of Object.values(value)) {
      const message = extractServerError(entry);
      if (message) return message;
    }
  }

  return null;
}

const emptyValues: HorseFormValues = {
  name: "",
  description: "",
  color: "",
  discipline: "",
  ageYears: "",
  heightCm: "",
  weightKg: "",
};

function toFormValues(record?: HorseRecord | null): HorseFormValues {
  if (!record) return { ...emptyValues };

  return {
    name: record.name ?? "",
    description: record.description ?? "",
    color: record.color ?? "",
    discipline: record.discipline ?? "",
    ageYears:
      record.ageYears !== null && record.ageYears !== undefined
        ? String(record.ageYears)
        : "",
    heightCm:
      record.heightCm !== null && record.heightCm !== undefined
        ? String(record.heightCm)
        : "",
    weightKg:
      record.weightKg !== null && record.weightKg !== undefined
        ? String(record.weightKg)
        : "",
  };
}

const numberErrorMessages: Record<"ageYears" | "heightCm" | "weightKg", string> = {
  ageYears: "Age must be a whole number.",
  heightCm: "Height must be a whole number.",
  weightKg: "Weight must be a number.",
};

export function HorseForm({
  ownerId,
  horseId,
  redirectTo,
  initialHorse,
  onSuccess,
}: HorseFormProps) {
  const router = useRouter();
  const [values, setValues] = React.useState<HorseFormValues>(emptyValues);
  const [status, setStatus] = React.useState<FormStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setValues(toFormValues(initialHorse));
  }, [initialHorse]);

  const handleChange = (field: keyof HorseFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((previous) => ({ ...previous, [field]: event.target.value }));
      setStatus("idle");
      setError(null);
    };

  const parseIntegerField = (
    key: "ageYears" | "heightCm",
    payload: Record<string, unknown>,
  ) => {
    const rawValue = values[key].trim();
    if (!rawValue) return true;

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      setStatus("error");
      setError(numberErrorMessages[key]);
      return false;
    }

    payload[key] = parsed;
    return true;
  };

  const parseFloatField = (
    key: "weightKg",
    payload: Record<string, unknown>,
  ) => {
    const rawValue = values[key].trim();
    if (!rawValue) return true;

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      setStatus("error");
      setError(numberErrorMessages[key]);
      return false;
    }

    payload[key] = parsed;
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = values.name.trim();
    if (!trimmedName) {
      setStatus("error");
      setError("A horse name is required.");
      return;
    }

    setStatus("saving");
    setError(null);

    const payload: Record<string, unknown> = {
      ownerId,
      name: trimmedName,
    };

    const trimmedDescription = values.description.trim();
    const trimmedColor = values.color.trim();
    const trimmedDiscipline = values.discipline.trim();

    if (trimmedDescription) payload.description = trimmedDescription;
    if (trimmedColor) payload.color = trimmedColor;
    if (trimmedDiscipline) payload.discipline = trimmedDiscipline;

    if (!parseIntegerField("ageYears", payload)) return;
    if (!parseIntegerField("heightCm", payload)) return;
    if (!parseFloatField("weightKg", payload)) return;

    if (horseId) {
      payload.id = horseId;
    }

    try {
      const response = await fetch("/api/horse", {
        method: horseId ? "PATCH" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: HorseRecord;
        error?: string;
        errors?: unknown;
      };

      if (!response.ok || !json.success || !json.data) {
        const serverError =
          json.error || extractServerError(json.errors) || "Failed to save the horse.";
        throw new Error(serverError);
      }

      setStatus("success");
      onSuccess?.(json.data);

      if (horseId) {
        setValues(toFormValues(json.data));
      } else {
        setValues({ ...emptyValues });
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (exception) {
      console.error(exception);
      setStatus("error");
      setError(
        exception instanceof Error ? exception.message : "Something went wrong.",
      );
    }
  };

  const isSaving = status === "saving";
  const submitLabel = horseId ? "Update horse" : "Save horse";

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="name">Horse name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Shadowfax"
            value={values.name}
            disabled={isSaving}
            onChange={handleChange("name")}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            placeholder="Bay"
            value={values.color}
            disabled={isSaving}
            onChange={handleChange("color")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="discipline">Discipline</Label>
          <Input
            id="discipline"
            name="discipline"
            placeholder="Dressage"
            value={values.discipline}
            disabled={isSaving}
            onChange={handleChange("discipline")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="ageYears">Age (years)</Label>
          <Input
            id="ageYears"
            name="ageYears"
            type="number"
            inputMode="numeric"
            value={values.ageYears}
            disabled={isSaving}
            onChange={handleChange("ageYears")}
            min={0}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input
            id="heightCm"
            name="heightCm"
            type="number"
            inputMode="numeric"
            value={values.heightCm}
            disabled={isSaving}
            onChange={handleChange("heightCm")}
            min={0}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            inputMode="decimal"
            value={values.weightKg}
            disabled={isSaving}
            onChange={handleChange("weightKg")}
            min={0}
            step="0.1"
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            placeholder="Temperament, care notes, favourite activities..."
            value={values.description}
            disabled={isSaving}
            onChange={handleChange("description")}
            className="min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : submitLabel}
        </Button>
        {status === "success" ? (
          <span className="text-sm text-muted-foreground">
            Horse saved successfully.
          </span>
        ) : null}
        {error ? <span className="text-sm text-destructive">{error}</span> : null}
      </div>
    </form>
  );
}
