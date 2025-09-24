"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LessonsFormValues = {
  date: String; // to do 
  horse: string; 
  moniteur: string;
  notes: string;
};

type LessonsFormProps = {
  onSubmit?: (values: LessonsFormValues) => void;
};

const emptyValues: LessonsFormValues = {
  date: "",
  horse: "",
  moniteur: "",
  notes: "",
};

export function LessonsForm({ onSubmit }: LessonsFormProps) {
  const [values, setValues] = React.useState<LessonsFormValues>(emptyValues);
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (field: keyof LessonsFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((previous) => ({ ...previous, [field]: event.target.value }));
      setSubmitted(false);
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(values);
    setSubmitted(true);
    setValues(emptyValues);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            placeholder="12/06"
            value={values.date}
            onChange={handleChange("date")}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="horse">Horse</Label>
          <Input
            id="horse"
            name="horse"
            placeholder="Arabian"
            value={values.horse}
            onChange={handleChange("horse")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="moniteur">Moniteur</Label>
          <Input
            id="moniteur"
            name="moniteur"
            placeholder="Stephan"
            value={values.moniteur}
            onChange={handleChange("moniteur")}
            inputMode="numeric"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Temperament, training stage, care notes..."
          value={values.notes}
          onChange={handleChange("notes")}
          className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Button type="submit">Save Lessons</Button>
        {submitted ? (
          <span className="text-sm text-muted-foreground">
            Lessons saved locally. Connect the form to your API when ready.
          </span>
        ) : null}
      </div>
    </form>
  );
}
