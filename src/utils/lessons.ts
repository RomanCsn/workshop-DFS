import { PrismaClient, Lesson, Prisma } from "@/generated/prisma";

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
      orderBy: { id: 'desc' },
    });
  } catch (err) {
    console.error('getAllLessons error:', err);
    throw new Error('Failed to retrieve the list of lessons.');
  }
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  try {
    return await prisma.lesson.findUnique({ where: { id } });
  } catch (err) {
    console.error('getLessonById error:', err);
    throw new Error('Error retrieving the lesson by id.');
  }
}

export async function updateLesson(
  id: string,
  data: Prisma.LessonUpdateInput
): Promise<Lesson> {
  try {
    return await prisma.lesson.update({ where: { id }, data });
  } catch (err) {
    console.error('updateLesson error:', err);
    throw new Error('Failed to update the lesson.');
  }
}

export async function deleteLesson(id: string): Promise<Lesson> {
  try {
    return await prisma.lesson.delete({ where: { id } });
  } catch (err) {
    console.error('deleteLesson error:', err);
    throw new Error('Failed to delete the lesson.');
  }
}


