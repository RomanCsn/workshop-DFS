import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
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
