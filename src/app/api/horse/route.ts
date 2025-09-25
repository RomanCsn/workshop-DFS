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

//GET ALL HORSES

export async function GET_ALL(request: NextRequest) {
  try {
    const horses = await prisma.horse.findMany();
    return NextResponse.json({
      success: true,
      data: horses,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

//GET ALL HORSES BY OWNER ID OR ALL HORSES
const ownerQuerySchema = z.object({ ownerId: z.string().min(1, "Owner identifier is required.") });

const sanitizeString = (value: unknown, max: number) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
};

const sanitizeInteger = (value: unknown, min: number, max: number) => {
  if (value === null || value === undefined || value === "") return undefined;
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (typeof numericValue !== "number" || !Number.isFinite(numericValue)) return undefined;
  const intValue = Math.trunc(numericValue);
  if (intValue < min || intValue > max) return undefined;
  return intValue;
};

const sanitizeFloat = (value: unknown, min: number, max: number) => {
  if (value === null || value === undefined || value === "") return undefined;
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (typeof numericValue !== "number" || !Number.isFinite(numericValue)) return undefined;
  if (numericValue < min || numericValue > max) return undefined;
  return numericValue;
};

const buildCreatePayload = (raw: unknown) => {
  const body = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const ownerId = typeof body.ownerId === "string" ? body.ownerId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!ownerId) {
    return { ok: false, error: "Owner identifier is missing." } as const;
  }

  if (!name) {
    return { ok: false, error: "Horse name is required." } as const;
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
  const body = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

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

//GET ALL HORSES BY OWNER ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");
    const parsed = ownerQuerySchema.safeParse({ ownerId });

    // If no ownerId is provided, return all horses
    if (!ownerId) {
      const horses = await prisma.horse.findMany();
      return NextResponse.json({
        success: true,
        data: horses,
      });
    }

    const zod = z.object({ ownerId: z.string().min(1) }).safeParse({ ownerId });
    if (!zod.success) {
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message ?? "Owner identifier is required.",
        },
        { status: 400 },
      );
    }

    const horses = await prisma.horse.findMany({
      where: {
        ownerId: parsed.data.ownerId,
      },
    });
    return NextResponse.json({
      success: true,
      data: horses,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

//PUT CREATE A HORSE
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

//PATCH (update) A HORSE
export async function PATCH(request: NextRequest) {
  try {
    const json = await request.json();
    const id = typeof json?.id === "string" ? json.id.trim() : "";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Horse identifier is missing.", received: json },
        { status: 400 },
      );
    }

    const updateData = buildUpdatePayload(json);

    if (!Object.keys(updateData).length) {
      return NextResponse.json(
        { success: false, error: "No changes provided.", received: json },
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

//DELETE A HORSE
export async function DELETE(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = z.object({ id: z.string().min(1) }).safeParse(json);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues.at(0);
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message ?? "Horse identifier is required.",
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
