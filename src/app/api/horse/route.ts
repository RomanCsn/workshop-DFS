// API: /api/horse

// GET
// - params: ownerId (string, required)
// - returns: 200 { success: true, data: Horse[] }
// - errors: 400 missing ownerId, 500 server error

// PUT (create)
// - body: { ownerId: string, name: string, description?: string, color?: string, discipline?: string, ageYears?: number, heightCm?: number, weightKg?: number }
// - returns: 200 { success: true, data: Horse }
// - errors: 400 invalid payload, 500 server error

// PATCH (update)
// - body: { id: string, ownerId?: string, name?: string, description?: string, color?: string, discipline?: string, ageYears?: number, heightCm?: number, weightKg?: number }
// - returns: 200 { success: true, data: Horse }
// - errors: 400 invalid payload, 500 server error

// DELETE
// - body: { id: string }
// - returns: 200 { success: true, data: Horse }
// - errors: 400 missing id, 500 server error

import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const prisma = new PrismaClient();

const ownerQuerySchema = z.object({
  ownerId: z.string().min(1, "L'identifiant proprietaire est requis."),
});

const sanitizeString = (value: unknown, max: number) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
};

const sanitizeInteger = (value: unknown, min: number, max: number) => {
  if (value === null || value === undefined || value === "") return undefined;
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (typeof numericValue !== "number" || !Number.isFinite(numericValue)) {
    return undefined;
  }
  const intValue = Math.trunc(numericValue);
  if (intValue < min || intValue > max) return undefined;
  return intValue;
};

const sanitizeFloat = (value: unknown, min: number, max: number) => {
  if (value === null || value === undefined || value === "") return undefined;
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (typeof numericValue !== "number" || !Number.isFinite(numericValue)) {
    return undefined;
  }
  if (numericValue < min || numericValue > max) return undefined;
  return numericValue;
};

const buildCreatePayload = (raw: unknown) => {
  const body =
    typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const ownerId = typeof body.ownerId === "string" ? body.ownerId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!ownerId) {
    return { ok: false, error: "Identifiant proprietaire manquant." } as const;
  }

  if (!name) {
    return { ok: false, error: "Le nom du cheval est obligatoire." } as const;
  }

  const data = {
    ownerId,
    name,
    description: sanitizeString(body.description, 2000),
    color: sanitizeString(body.color, 100),
    discipline: sanitizeString(body.discipline, 100),
    ageYears: sanitizeInteger(body.ageYears, 0, 60),
    heightCm: sanitizeInteger(body.heightCm, 0, 250),
    weightKg: sanitizeFloat(body.weightKg, 0, 2000),
  } satisfies Record<string, string | number | undefined>;

  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number>;

  return { ok: true, data: cleaned } as const;
};

const buildUpdatePayload = (raw: unknown) => {
  const body =
    typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const data = {
    ownerId: sanitizeString(body.ownerId, 100),
    name: sanitizeString(body.name, 100),
    description: sanitizeString(body.description, 2000),
    color: sanitizeString(body.color, 100),
    discipline: sanitizeString(body.discipline, 100),
    ageYears: sanitizeInteger(body.ageYears, 0, 60),
    heightCm: sanitizeInteger(body.heightCm, 0, 250),
    weightKg: sanitizeFloat(body.weightKg, 0, 2000),
  } satisfies Record<string, string | number | undefined>;

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number>;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    // If no ownerId is provided, return all horses with owner information
    if (!ownerId) {
      const horses = await prisma.horse.findMany({
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });
      return NextResponse.json({
        success: true,
        data: horses,
      });
    }

    const parsed = ownerQuerySchema.safeParse({ ownerId });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues.at(0);
      return NextResponse.json(
        {
          success: false,
          error:
            firstIssue?.message ?? "L'identifiant proprietaire est requis.",
        },
        { status: 400 },
      );
    }

    const horses = await prisma.horse.findMany({
      where: {
        ownerId: parsed.data.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: horses,
    });
  } catch (error) {
    console.error("Impossible de recuperer les chevaux", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const result = buildCreatePayload(json);

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error, received: json },
        { status: 400 },
      );
    }

    const horse = await prisma.horse.create({
      data: result.data,
    });
    return NextResponse.json({
      success: true,
      data: horse,
    });
  } catch (error) {
    console.error("Erreur lors de la creation d'un cheval", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const json = await request.json();
    const id = typeof json?.id === "string" ? json.id.trim() : "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiant du cheval manquant.",
          received: json,
        },
        { status: 400 },
      );
    }

    const updateData = buildUpdatePayload(json);

    if (!Object.keys(updateData).length) {
      return NextResponse.json(
        { success: false, error: "Aucune modification fournie.", received: json },
        { status: 400 },
      );
    }

    const horse = await prisma.horse.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({
      success: true,
      data: horse,
    });
  } catch (error) {
    console.error("Erreur lors de la mise a jour d'un cheval", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = z.object({ id: z.string().min(1) }).safeParse(json);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues.at(0);
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message ?? "Identifiant du cheval requis.",
        },
        { status: 400 },
      );
    }

    const { id } = parsed.data;
    const horse = await prisma.horse.delete({
      where: { id },
    });
    return NextResponse.json({
      success: true,
      data: horse,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression d'un cheval", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}
