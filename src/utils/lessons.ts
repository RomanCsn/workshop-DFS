import { PrismaClient, Lesson, Prisma, Status } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function createLesson(
  data: Prisma.LessonCreateInput
): Promise<Lesson> {
  try {
    return await prisma.lesson.create({ data });
  } catch (err) {
    console.error('createLesson error:', err);
    throw new Error('Failed to create the lesson.');
  }
}

export async function getAllLessons(
  take = 100,
  skip = 0
): Promise<Lesson[]> {
  try {
    return await prisma.lesson.findMany({
      take,
      skip,
      orderBy: { date: 'desc' },
      include: {
        monitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        horse: {
          select: {
            id: true,
            name: true,
          },
        },
        performedServices: true,
      },
    });
  } catch (err) {
    console.error('getAllLessons error:', err);
    throw new Error("Failed to retrieve the list of lessons.");
  }
}

export async function getLessonById(
  id: string
): Promise<Lesson | null> {
  try {
    return await prisma.lesson.findUnique({ 
      where: { id },
      include: {
        monitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        horse: true,
        performedServices: {
          include: {
            billing: true,
          },
        },
      },
    });
  } catch (err) {
    console.error('getLessonById error:', err);
    throw new Error("Error retrieving the lesson by id.");
  }
}

export async function updateLesson(
  id: string,
  data: Prisma.LessonUpdateInput
): Promise<Lesson> {
  try {
    return await prisma.lesson.update({ 
      where: { id }, 
      data,
      include: {
        monitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        horse: {
          select: {
            id: true,
            name: true,
          },
        },
        performedServices: true,
      },
    });
  } catch (err) {
    console.error('updateLesson error:', err);
    throw new Error("Failed to update the lesson.");
  }
}

export async function deleteLesson(
  id: string
): Promise<Lesson> {
  try {
    // Use a transaction to first delete related PerformedServices, then the lesson
    return await prisma.$transaction(async (prisma) => {
      // First, delete all related PerformedServices
      await prisma.performedService.deleteMany({
        where: {
          serviceId: id,
        },
      });

      // Then delete the lesson
      return await prisma.lesson.delete({ 
        where: { id },
        include: {
          monitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          horse: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  } catch (err) {
    console.error('deleteLesson error:', err);
    throw new Error("Failed to delete the lesson.");
  }
}

export async function getLessonsByStatus(
  status: Status,
  take = 100,
  skip = 0
): Promise<Lesson[]> {
  try {
    return await prisma.lesson.findMany({
      where: { status },
      take,
      skip,
      orderBy: { date: 'desc' },
      include: {
        monitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        horse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (err) {
    console.error('getLessonsByStatus error:', err);
    throw new Error("Failed to retrieve lessons by status.");
  }
}

export async function getLessonsByDateRange(
  startDate: Date,
  endDate: Date,
  take = 100,
  skip = 0
): Promise<Lesson[]> {
  try {
    return await prisma.lesson.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      take,
      skip,
      orderBy: { date: 'asc' },
      include: {
        monitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        horse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (err) {
    console.error('getLessonsByDateRange error:', err);
    throw new Error("Failed to retrieve lessons by date range.");
  }
}

export async function getLessonsByCustomerId(
  customerId: string,
  take = 100,
  skip = 0
): Promise<Lesson[]> {
  try {
    return await prisma.lesson.findMany({
      where: { customerId },
      take,
      skip,
      orderBy: { date: 'desc' },
      include: {
        monitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        horse: {
          select: {
            id: true,
            name: true,
          },
        },
        performedServices: true,
      },
    });
  } catch (err) {
    console.error('getLessonsByCustomerId error:', err);
    throw new Error("Failed to retrieve lessons by customer.");
  }
}

export async function getLessonsByMonitorId(
  monitorId: string,
  take = 100,
  skip = 0
): Promise<Lesson[]> {
  try {
    return await prisma.lesson.findMany({
      where: { monitorId },
      take,
      skip,
      orderBy: { date: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        horse: {
          select: {
            id: true,
            name: true,
          },
        },
        performedServices: true,
      },
    });
  } catch (err) {
    console.error('getLessonsByMonitorId error:', err);
    throw new Error("Failed to retrieve lessons by monitor.");
  }
}

export async function updateLessonStatus(
  id: string,
  status: Status
): Promise<Lesson> {
  try {
    return await prisma.lesson.update({
      where: { id },
      data: { status },
      include: {
        monitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  } catch (err) {
    console.error('updateLessonStatus error:', err);
    throw new Error("Failed to update lesson status.");
  }
}
