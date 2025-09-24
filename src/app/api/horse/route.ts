// API: /api/horse

// GET
// - params: ownerId (string, required)
// - returns: 200 { success: true, data: Horse[] }
// - errors: 400 missing ownerId, 500 server error

// PUT (create)
// - body: { name?: string, ownerId: string }
// - returns: 200 { success: true, data: Horse }
// - errors: 400 missing ownerId, 500 server error

// PATCH (update)
// - body: { id: string, name?: string, ownerId?: string }
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

//GET ALL HORSES BY OWNER ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    const zod = z.object({ ownerId: z.string().min(1) }).safeParse({ ownerId });
    if (!zod.success) {
      return NextResponse.json(
        { success: false, errors: zod.error.flatten() },
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

//PUT CREATE A HORSE
export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const zod = z
      .object({
        ownerId: z.string().min(1),
        name: z.string().min(1).optional(),
      })
      .safeParse(json);
    if (!zod.success) {
      return NextResponse.json(
        { success: false, errors: zod.error.flatten() },
        { status: 400 },
      );
    }

    const { name, ownerId } = zod.data;

    const horse = await prisma.horse.create({
      data: {
        name: name,
        ownerId,
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
    const zod = z
      .object({
        id: z.string().min(1),
        name: z.string().min(1).optional(),
        ownerId: z.string().min(1).optional(),
      })
      .safeParse(json);
    if (!zod.success) {
      return NextResponse.json(
        { success: false, errors: zod.error.flatten() },
        { status: 400 },
      );
    }

    const { id, name, ownerId } = zod.data;

    const horse = await prisma.horse.update({
      where: { id },
      data: { name, ownerId },
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
        { success: false, errors: zod.error.flatten() },
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
