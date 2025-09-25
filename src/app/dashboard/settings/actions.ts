"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";

import type { PasswordActionState } from "./contracts";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Saisissez votre mot de passe actuel."),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirmez votre nouveau mot de passe."),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

export async function changePasswordAction(
  _prevState: PasswordActionState | undefined,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = passwordSchema.safeParse({
    currentPassword: getFormValue(formData, "currentPassword"),
    newPassword: getFormValue(formData, "newPassword"),
    confirmPassword: getFormValue(formData, "confirmPassword"),
    revokeOtherSessions: formData.get("revokeOtherSessions") === "on",
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return {
      status: "error",
      message: "Veuillez verifier les champs surlignes.",
      fieldErrors: {
        currentPassword: fieldErrors.currentPassword?.[0],
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  try {
    const headerList = await headers();

    await auth.api.changePassword({
      headers: headerList,
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: parsed.data.revokeOtherSessions,
      },
    });

    if (parsed.data.revokeOtherSessions) {
      revalidatePath("/dashboard/settings");
    }

    return {
      status: "success",
      message: "Mot de passe mis a jour avec succes.",
    };
  } catch (error) {
    console.error("changePasswordAction", error);

    return {
      status: "error",
      message:
        "Impossible de mettre a jour le mot de passe. Verifiez vos informations et reessayez.",
    };
  }
}

type SimpleActionResponse = {
  status: "success" | "error";
  message: string;
};

export async function revokeSessionAction(
  token: string,
): Promise<SimpleActionResponse> {
  if (!token) {
    return {
      status: "error",
      message: "Jeton de session manquant.",
    };
  }

  try {
    const headerList = await headers();

    await auth.api.revokeSession({
      headers: headerList,
      body: { token },
    });

    revalidatePath("/dashboard/settings");

    return {
      status: "success",
      message: "Session revoquee.",
    };
  } catch (error) {
    console.error("revokeSessionAction", error);

    return {
      status: "error",
      message: "Echec de la revocation de la session selectionnee.",
    };
  }
}

export async function revokeOtherSessionsAction(): Promise<SimpleActionResponse> {
  try {
    const headerList = await headers();

    await auth.api.revokeOtherSessions({
      headers: headerList,
    });

    revalidatePath("/dashboard/settings");

    return {
      status: "success",
      message: "Toutes les autres sessions ont ete deconnectees.",
    };
  } catch (error) {
    console.error("revokeOtherSessionsAction", error);

    return {
      status: "error",
      message: "Impossible de revoquer les sessions pour le moment. Merci de reessayer bientot.",
    };
  }
}

function getFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}
