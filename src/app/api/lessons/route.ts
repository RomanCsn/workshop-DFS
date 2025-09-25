import { NextRequest, NextResponse } from "next/server";
import {
  createLesson,
  getAllLessons,
  updateLesson,
  deleteLesson,
  getLessonById,
  getLessonsByStatus,
  getLessonsByDateRange,
  getLessonsByCustomerId,
  getLessonsByMonitorId,
  updateLessonStatus,
} from "@/utils/lessons";
import { z } from "zod";

/**
 * Helper: Preprocessor for query parameters that may be
 * null | undefined | '' or a numeric string -> returns a valid number
 * or leaves the input as is so Zod can properly reject it.
 */
const parseQueryNumber = (defaultValue: number) =>
  z.preprocess((val) => {
    // URLSearchParams.get(...) returns string | null

    if (val === null || val === undefined || val === "") return defaultValue;
    const parsed = parseInt(String(val), 10);
    return Number.isNaN(parsed) ? val : parsed;
  }, z.number().int());

/**
 * Helper: Preprocessor for date parameters
 */
const parseQueryDate = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") return undefined;
  const date = new Date(String(val));
  return isNaN(date.getTime()) ? val : date;
}, z.date().optional());

const QueryParamsSchema = z.object({
  take: parseQueryNumber(100).refine((n) => n >= 1 && n <= 1000, {
    message: "take doit etre compris entre 1 et 1000",
  }),
  skip: parseQueryNumber(0).refine((n) => n >= 0, {
    message: "skip doit etre >= 0",
  }),
  status: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined;
      return val;
    },
    z.enum(["PENDING", "IN_PROGRESS", "FINISHED"]).optional(),
  ),
  startDate: parseQueryDate,
  endDate: parseQueryDate,
  customerId: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    return val;
  }, z.string().uuid("customerId doit etre un UUID valide").optional()),
  monitorId: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    return val;
  }, z.string().uuid("monitorId doit etre un UUID valide").optional()),
  id: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    return val;
  }, z.string().uuid("id doit etre un UUID valide").optional()),
});

// Body schemas
const CreateLessonSchema = z.object({
  date: z.preprocess((val) => {
    if (typeof val === "string") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? val : date;
    }
    return val;
  }, z.date("date doit etre une date valide")),
  desc: z
    .string()
    .min(1, "La description est obligatoire")
    .max(1000, "La description doit comporter moins de 1000 caracteres"),
  status: z.enum(["PENDING", "IN_PROGRESS", "FINISHED"]).default("PENDING"),
  monitorId: z.string().uuid("monitorId doit etre un UUID valide"),
  customerId: z.string().uuid("customerId doit etre un UUID valide"),
  horseId: z.string().uuid("horseId doit etre un UUID valide"),
});

const UpdateLessonSchema = z.object({
  id: z.string().uuid("id doit etre un UUID valide"),
  date: z
    .preprocess((val) => {
      if (typeof val === "string") {
        const date = new Date(val);
        return isNaN(date.getTime()) ? val : date;
      }
      return val;
    }, z.date("date doit etre une date valide"))
    .optional(),
  desc: z
    .string()
    .min(1, "La description est obligatoire")
    .max(1000, "La description doit comporter moins de 1000 caracteres")
    .optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "FINISHED"]).optional(),
  monitorId: z.string().uuid("monitorId doit etre un UUID valide").optional(),
  customerId: z.string().uuid("customerId doit etre un UUID valide").optional(),
  horseId: z.string().uuid("horseId doit etre un UUID valide").optional(),
});

const UpdateStatusSchema = z.object({
  id: z.string().uuid("id doit etre un UUID valide"),
  status: z.enum(["PENDING", "IN_PROGRESS", "FINISHED"]),
});

const DeleteLessonSchema = z.object({
  id: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    return val;
  }, z.string().uuid("id doit etre un UUID valide")),
});

// GET /api/lessons - Get lessons with various filters

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const validationResult = QueryParamsSchema.safeParse({
      take: searchParams.get("take"),
      skip: searchParams.get("skip"),
      status: searchParams.get("status"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      customerId: searchParams.get("customerId"),
      monitorId: searchParams.get("monitorId"),
      id: searchParams.get("id"),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Parametres de requete invalides",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const {
      take,
      skip,
      status,
      startDate,
      endDate,
      customerId,
      monitorId,
      id,
    } = validationResult.data;

    // If specific ID is requested
    if (id) {
      const lesson = await getLessonById(id);

      if (!lesson) {
        return NextResponse.json(
          {
            success: false,
            error: "Lecon introuvable",
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: lesson,
      });
    }

    let lessons;

    // Filter by customer ID
    if (customerId) {
      lessons = await getLessonsByCustomerId(customerId, take, skip);
    }
    // Filter by monitor ID
    else if (monitorId) {
      lessons = await getLessonsByMonitorId(monitorId, take, skip);
    }
    // Filter by status
    else if (status) {
      lessons = await getLessonsByStatus(status, take, skip);
    }
    // Filter by date range
    else if (startDate && endDate) {
      if (startDate > endDate) {
        return NextResponse.json(
          {
            success: false,
            error: "startDate doit preceder endDate",
          },
          { status: 400 },
        );
      }
      lessons = await getLessonsByDateRange(startDate, endDate, take, skip);
    }
    // Default: get all lessons
    else {
      lessons = await getAllLessons(take, skip);
    }

    return NextResponse.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error("GET /api/lessons error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

// POST /api/lessons - Create a new lesson
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = CreateLessonSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Donnees invalides",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const validatedData = validationResult.data;

    // Transform to match Prisma expected format
    const lesson = await createLesson({
      date: validatedData.date,
      desc: validatedData.desc,
      status: validatedData.status,
      monitor: { connect: { id: validatedData.monitorId } },
      customer: { connect: { id: validatedData.customerId } },
      horse: { connect: { id: validatedData.horseId } },
    });

    return NextResponse.json(
      {
        success: true,
        data: lesson,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/lessons error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

// PUT /api/lessons - Update a lesson
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = UpdateLessonSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Donnees invalides",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { id, monitorId, customerId, horseId, ...otherData } =
      validationResult.data;

    // Transform the data to match Prisma's expected format
    const updateData: any = { ...otherData };

    if (monitorId) {
      updateData.monitor = { connect: { id: monitorId } };
    }
    if (customerId) {
      updateData.customer = { connect: { id: customerId } };
    }
    if (horseId) {
      updateData.horse = { connect: { id: horseId } };
    }

    const lesson = await updateLesson(id, updateData);

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error("PUT /api/lessons error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

// PATCH /api/lessons/status - Update lesson status only
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = UpdateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Donnees invalides",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { id, status } = validationResult.data;
    const lesson = await updateLessonStatus(id, status);

    return NextResponse.json({
      success: true,
      data: lesson,
      message: `Statut de la lecon mis a jour en ${status}`,
    });
  } catch (error) {
    console.error("PATCH /api/lessons error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/lessons - Delete a lesson
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const validationResult = DeleteLessonSchema.safeParse({ id });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiant invalide ou manquant",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { id: validatedId } = validationResult.data;
    const lesson = await deleteLesson(validatedId);

    return NextResponse.json({
      success: true,
      data: lesson,
      message: "Lecon supprimee avec succes",
    });
  } catch (error) {
    console.error("DELETE /api/lessons error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}
