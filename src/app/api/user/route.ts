import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const prisma = new PrismaClient();

const parseNumber = (defaultValue: number, min: number, max?: number) =>
  z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return defaultValue;
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : val;
  }, max ? z.number().int().min(min).max(max) : z.number().int().min(min));

const listQuerySchema = z.object({
  role: z.enum(["OWNER", "CUSTOMER", "ADMIN", "MONITOR", "CAREGIVER"]),
  take: parseNumber(50, 1, 200).optional(),
  skip: parseNumber(0, 0).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role");

  if (roleParam) {
    const validation = listQuerySchema.safeParse({
      role: roleParam,
      take: searchParams.get("take"),
      skip: searchParams.get("skip"),
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const { role, take = 50, skip = 0 } = validation.data;

    const users = await prisma.user.findMany({
      where: { role },
      take,
      skip,
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  }

  const baseWhere = {
    role: { in: ["OWNER", "CUSTOMER"] },
  } as const

  const totalCustomers = await prisma.user.count({
    where: baseWhere,
  })

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const lastSixMonthsCustomers = await prisma.user.count({
    where: {
      ...baseWhere,
      createdAt: { gte: sixMonthsAgo },
    },
  })

  const percentageLastSixMonths = totalCustomers
    ? Math.round((lastSixMonthsCustomers / totalCustomers) * 100)
    : 0

  return NextResponse.json({
    success: true,
    data: {
      totalCustomers,
      lastSixMonthsCustomers,
      percentageLastSixMonths,
    },
  });
}
