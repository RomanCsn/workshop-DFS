import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.count({
    where: {
      role: { in: ["OWNER", "CUSTOMER"] },
    },
  });

  return NextResponse.json({
    success: true,
    data: users,
  });
}
