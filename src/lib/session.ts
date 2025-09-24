import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const getCurrentSession = cache(async () => {
  try {
    const headerList = headers();
    return await auth.api.getSession({ headers: headerList });
  } catch (error) {
    console.error("Failed to fetch session", error);
    return null;
  }
});

export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();
  return session?.user ?? null;
});
