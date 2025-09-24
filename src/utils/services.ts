import { PrismaClient, PerformedService, Prisma } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function createPerformedService(
  data: Prisma.PerformedServiceCreateInput,
): Promise<PerformedService> {
  try {
    return await prisma.performedService.create({ data });
  } catch (err) {
    console.error("createPerformedService error:", err);
    throw new Error("Failed to create the service.");
  }
}

export async function getAllPerformedServices(
  take = 100,
  skip = 0,
): Promise<PerformedService[]> {
  try {
    return await prisma.performedService.findMany({
      take,
      skip,
      orderBy: { id: "desc" },
    });
  } catch (err) {
    console.error("getAllPerformedServices error:", err);
    throw new Error("Failed to retrieve the list of services.");
  }
}

export async function getPerformedServiceById(
  id: string,
): Promise<PerformedService | null> {
  try {
    return await prisma.performedService.findUnique({ where: { id } });
  } catch (err) {
    console.error("getPerformedServiceById error:", err);
    throw new Error("Error retrieving the service by id.");
  }
}

export async function updatePerformedService(
  id: string,
  data: Prisma.PerformedServiceUpdateInput,
): Promise<PerformedService> {
  try {
    return await prisma.performedService.update({ where: { id }, data });
  } catch (err) {
    console.error("updatePerformedService error:", err);
    throw new Error("Failed to update the service.");
  }
}

export async function deletePerformedService(
  id: string,
): Promise<PerformedService> {
  try {
    return await prisma.performedService.delete({ where: { id } });
  } catch (err) {
    console.error("deletePerformedService error:", err);
    throw new Error("Failed to delete the service.");
  }
}
