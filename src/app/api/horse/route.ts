// API: /api/horse

// GET
// - params: ownerId (string, required)
// - returns: 200 { success: true, data: Horse[] }
// - errors: 400 missing ownerId, 500 server error

// PUT (create)
// - body: { ownerId: string, name: string, description?: string, color?: string, discipline?: string, ageYears?: number, heightCm?: number, weightKg?: number }
// - returns: 200 { success: true, data: Horse }
// - errors: 400 missing ownerId, 500 server error

// PATCH (update)
// - body: { id: string, ownerId?: string, name?: string, description?: string, color?: string, discipline?: string, ageYears?: number, heightCm?: number, weightKg?: number }
// - returns: 200 { success: true, data: Horse }
// - errors: 400 missing id, 500 server error

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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

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
        { success: false, errors: z.treeifyError(zod.error) },
        { status: 400 },
      );
    }

    const horses = await prisma.horse.findMany({
      where: {
        ownerId: zod.data.ownerId,
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

const horseMetricsSchema = z.object({
  description: z.string().trim().max(2000).optional(),
  color: z.string().trim().max(100).optional(),
  discipline: z.string().trim().max(100).optional(),
  ageYears: z.number().int().min(0).max(60).optional(),
  heightCm: z.number().int().min(0).max(250).optional(),
  weightKg: z.number().min(0).max(2000).optional(),
});

const horseCreateSchema = horseMetricsSchema.extend({
  ownerId: z.string().min(1),
  name: z.string().trim().min(1),
});

const horseUpdateSchema = horseMetricsSchema.extend({
  id: z.string().min(1),
  ownerId: z.string().min(1).optional(),
  name: z.string().trim().min(1).optional(),
});

//PUT CREATE A HORSE
export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const zod = horseCreateSchema.safeParse(json);
    if (!zod.success) {
      return NextResponse.json(
        { success: false, errors: z.treeifyError(zod.error) },
        { status: 400 },
      );
    }

    const { ownerId, name, ...rest } = zod.data;

    const horse = await prisma.horse.create({
      data: {
        ownerId,
        name,
        ...rest,
      },
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
    const zod = horseUpdateSchema.safeParse(json);
    if (!zod.success) {
      return NextResponse.json(
        { success: false, errors: z.treeifyError(zod.error) },
        { status: 400 },
      );
    }

    const { id, ...rest } = zod.data;

    const horse = await prisma.horse.update({
      where: { id },
      data: rest,
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
    const zod = z.object({ id: z.string().min(1) }).safeParse(json);
    if (!zod.success) {
      return NextResponse.json(
        { success: false, errors: z.treeifyError(zod.error) },
        { status: 400 },
      );
    }

    const { id } = zod.data;
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
