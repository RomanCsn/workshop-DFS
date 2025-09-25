"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type DeleteHorseButtonProps = {
  horseId: string;
  redirectTo?: string;
};

export function DeleteHorseButton({ horseId, redirectTo = "/dashboard/horses" }: DeleteHorseButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm("Voulez-vous vraiment supprimer ce cheval ?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/horse", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: horseId }),
      });
      const payload = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Impossible de supprimer le cheval.");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("Suppression impossible. Merci de reessayer.");
      setIsDeleting(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? "Suppression..." : "Supprimer"}
    </Button>
  );
}
