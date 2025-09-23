import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createLesson,
  getAllLessons,
  updateLesson,
  deleteLesson,
} from '@/utils/lessons';

// Helpers
const parseQueryNumber = (defaultValue: number) =>
  z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return defaultValue;
    const parsed = parseInt(String(val), 10);
    return Number.isNaN(parsed) ? val : parsed;
  }, z.number().int());

const QueryParamsSchema = z.object({
  take: parseQueryNumber(100).refine((n) => n >= 1 && n <= 1000, {
    message: 'take must be between 1 and 1000',
  }),
  skip: parseQueryNumber(0).refine((n) => n >= 0, {
    message: 'skip must be >= 0',
  }),
});

// Body schemas
const StatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'FINISHED']);

const CreateLessonSchema = z.object({
  date: z.date(),
  desc: z.string().min(1),
  status: StatusEnum.default('PENDING'),
  monitorId: z.uuid('monitorId must be a valid UUID'),
  customerId: z.uuid('customerId must be a valid UUID'),
  horseId: z.uuid('horseId must be a valid UUID'),
});

const UpdateLessonSchema = z.object({
  id: z.uuid('id must be a valid UUID'),
  date: z.date().optional(),
  desc: z.string().min(1).optional(),
  status: StatusEnum.optional(),
  monitorId: z.uuid('monitorId must be a valid UUID').optional(),
  customerId: z.uuid('customerId must be a valid UUID').optional(),
  horseId: z.uuid('horseId must be a valid UUID').optional(),
});

const DeleteLessonSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

// GET /api/lessons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const validationResult = QueryParamsSchema.safeParse({
      take: searchParams.get('take'),
      skip: searchParams.get('skip'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: z.treeifyError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const { take, skip } = validationResult.data;
    const lessons = await getAllLessons(take, skip);

    return NextResponse.json({ success: true, data: lessons });
  } catch (error) {
    console.error('GET /api/lessons error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// POST /api/lessons
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateLessonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          details: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    const lesson = await createLesson({
      date: new Date(data.date),
      desc: data.desc,
      status: data.status,
      monitor: { connect: { id: data.monitorId } },
      customer: { connect: { id: data.customerId } },
      horse: { connect: { id: data.horseId } },
    });

    return NextResponse.json({ success: true, data: lesson }, { status: 201 });
  } catch (error) {
    console.error('POST /api/lessons error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// PUT /api/lessons
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = UpdateLessonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          details: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const { id, date, desc, status, monitorId, customerId, horseId } = validation.data;

    const updateData: any = {};
    if (date) updateData.date = new Date(date);
    if (desc) updateData.desc = desc;
    if (status) updateData.status = status;
    if (monitorId) updateData.monitor = { connect: { id: monitorId } };
    if (customerId) updateData.customer = { connect: { id: customerId } };
    if (horseId) updateData.horse = { connect: { id: horseId } };

    const lesson = await updateLesson(id, updateData);

    return NextResponse.json({ success: true, data: lesson });
  } catch (error) {
    console.error('PUT /api/lessons error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// DELETE /api/lessons
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const validation = DeleteLessonSchema.safeParse({ id });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing ID',
          details: z.treeifyError(validation.error),
        },
        { status: 400 },
      );
    }

    const deleted = await deleteLesson(validation.data.id);
    return NextResponse.json({ success: true, data: deleted, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/lessons error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}


