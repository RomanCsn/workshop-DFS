import { PrismaClient, Billing, Prisma } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function createBilling(
  data: Prisma.BillingCreateInput,
): Promise<Billing> {
  try {
    return await prisma.billing.create({ data });
  } catch (err) {
    console.error("createBilling error:", err);
    throw new Error("Failed to create the billing.");
  }
}

export async function getAllBillings(take = 100, skip = 0): Promise<Billing[]> {
  try {
    return await prisma.billing.findMany({
      take,
      skip,
      orderBy: { date: "desc" },
      include: {
        services: true,
      },
    });
  } catch (err) {
    console.error("getAllBillings error:", err);
    throw new Error("Failed to retrieve the list of billings.");
  }
}

export async function getBillingById(id: string): Promise<Billing | null> {
  try {
    return await prisma.billing.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });
  } catch (err) {
    console.error("getBillingById error:", err);
    throw new Error("Error retrieving the billing by id.");
  }
}

export async function updateBilling(
  id: string,
  data: Prisma.BillingUpdateInput,
): Promise<Billing> {
  try {
    return await prisma.billing.update({
      where: { id },
      data,
      include: {
        services: true,
      },
    });
  } catch (err) {
    console.error("updateBilling error:", err);
    throw new Error("Failed to update the billing.");
  }
}

export async function deleteBilling(id: string): Promise<Billing> {
  try {
    return await prisma.billing.delete({
      where: { id },
      include: {
        services: true,
      },
    });
  } catch (err) {
    console.error("deleteBilling error:", err);
    throw new Error("Failed to delete the billing.");
  }
}

export async function getBillingWithServices(
  id: string,
): Promise<Billing | null> {
  try {
    return await prisma.billing.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            lesson: {
              select: {
                id: true,
                date: true,
                desc: true,
                status: true,
              },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("getBillingWithServices error:", err);
    throw new Error("Error retrieving the billing with services.");
  }
}

export async function getBillingsByDateRange(
  startDate: Date,
  endDate: Date,
  take = 100,
  skip = 0,
): Promise<Billing[]> {
  try {
    return await prisma.billing.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      take,
      skip,
      orderBy: { date: "desc" },
      include: {
        services: true,
      },
    });
  } catch (err) {
    console.error("getBillingsByDateRange error:", err);
    throw new Error("Failed to retrieve billings by date range.");
  }
}

export async function getBillingCount(): Promise<number> {
  try {
    return await prisma.billing.count();
  } catch (err) {
    console.error("getBillingCount error:", err);
    throw new Error("Failed to get billing count.");
  }
}
