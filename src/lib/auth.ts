import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { PrismaClient } from "@/generated/prisma";
const prisma = new PrismaClient();

export const auth = betterAuth({
  // TODO: add roles (admin, owner, customer, monitor, caregiver)
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [ nextCookies() ]
});
