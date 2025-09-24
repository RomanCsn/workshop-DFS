"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type HorseFormValues = {
  name: string;
  breed: string;
  age: string;
  color: string;
  notes: string;
};

type HorseFormProps = {
  onSubmit?: (values: HorseFormValues) => void;
};

const emptyValues: HorseFormValues = {
  name: "",
  breed: "",
  age: "",
  color: "",
  notes: "",
};

export function HorseForm({ onSubmit }: HorseFormProps) {
  const [values, setValues] = React.useState<HorseFormValues>(emptyValues);
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (field: keyof HorseFormValues) =>
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
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Hidalgo"
            value={values.name}
            onChange={handleChange("name")}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            name="breed"
            placeholder="Arabian"
            value={values.breed}
            onChange={handleChange("breed")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            placeholder="6"
            value={values.age}
            onChange={handleChange("age")}
            inputMode="numeric"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            placeholder="Bay"
            value={values.color}
            onChange={handleChange("color")}
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
        <Button type="submit">Save horse</Button>
        {submitted ? (
          <span className="text-sm text-muted-foreground">
            Horse saved locally. Connect the form to your API when ready.
          </span>
        ) : null}
      </div>
    </form>
  );
}
