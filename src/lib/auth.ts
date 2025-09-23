import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createFieldAttribute } from "better-auth/db";
import { nextCookies } from "better-auth/next-js";
import { z } from "zod";

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const roleValidator = z.enum(["owner", "customer", "monitor", "caregiver"]);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            firstName: createFieldAttribute("string"),
            lastName: createFieldAttribute("string"),
            phone: createFieldAttribute("string"),
            role: createFieldAttribute("string", {
                validator: {
                    input: roleValidator,
                },
            }),
        },
    },
    plugins: [nextCookies()],
});
