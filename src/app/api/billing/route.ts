import { NextRequest, NextResponse } from "next/server";
import {
  createBilling,
  getAllBillings,
  updateBilling,
  deleteBilling,
  getBillingById,
  getBillingWithServices,
  getBillingsByDateRange,
  getBillingsByUserId,
} from '@/utils/billing';
import { z } from 'zod';

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

const parseOptionalUuid = (message: string) =>
  z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    return val;
  }, z.string().uuid(message).optional());

const QueryParamsSchema = z.object({
  take: parseQueryNumber(100).refine((n) => n >= 1 && n <= 1000, {
    message: "take doit etre compris entre 1 et 1000",
  }),
  skip: parseQueryNumber(0).refine((n) => n >= 0, {
    message: "skip doit etre >= 0",
  }),
  includeServices: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return false;
    return String(val).toLowerCase() === "true";
  }, z.boolean().default(false)),
  startDate: parseQueryDate,
  endDate: parseQueryDate,
  id: z.string().uuid('id doit etre un UUID valide').optional(),
  userId: z.string().min(1).optional(),
});

// Body schemas
const CreateBillingSchema = z.object({
  date: z.preprocess((val) => {
    if (typeof val === "string") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? val : date;
    }
    return val;
  }, z.date("date doit etre une date valide")),
});

const UpdateBillingSchema = z.object({
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
});

const DeleteBillingSchema = z.object({
  id: z.string().uuid("id doit etre un UUID valide"),
});

// GET /api/billing - Get billings with various filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const validationResult = QueryParamsSchema.safeParse({
      take: searchParams.get('take'),
      skip: searchParams.get('skip'),
      includeServices: searchParams.get('includeServices'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      id: searchParams.get('id') ?? undefined,
      userId: searchParams.get('userId') ?? undefined,
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

    const { take, skip, includeServices, startDate, endDate, id, userId } = validationResult.data;

    let billings;

    // If specific ID is requested
    if (id) {
      const billing = includeServices
        ? await getBillingWithServices(id)
        : await getBillingById(id);

      if (!billing) {
        return NextResponse.json(
          {
            success: false,
            error: "Facture introuvable",
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: billing,
      });
    }

    // If filtering by userId
    if (userId) {
      billings = await getBillingsByUserId(userId, take, skip);
    } else if (startDate && endDate) {
      if (startDate > endDate) {
        return NextResponse.json(
          {
            success: false,
            error: "startDate doit preceder endDate",
          },
          { status: 400 },
        );
      }
      billings = await getBillingsByDateRange(startDate, endDate, take, skip);
    } else {
      // Default: get all billings
      billings = await getAllBillings(take, skip);
    }

    return NextResponse.json({
      success: true,
      data: billings,
    });
  } catch (error) {
    console.error("GET /api/billing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

// POST /api/billing - Create a new billing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = CreateBillingSchema.safeParse(body);

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
    const billing = await createBilling(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: billing,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/billing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

// PUT /api/billing - Update a billing
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = UpdateBillingSchema.safeParse(body);

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

    const { id, ...updateData } = validationResult.data;
    const billing = await updateBilling(id, updateData);

    return NextResponse.json({
      success: true,
      data: billing,
    });
  } catch (error) {
    console.error("PUT /api/billing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/billing - Delete a billing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const validationResult = DeleteBillingSchema.safeParse({ id });

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
    const billing = await deleteBilling(validatedId);

    return NextResponse.json({
      success: true,
      data: billing,
      message: "Facture supprimee avec succes",
    });
  } catch (error) {
    console.error("DELETE /api/billing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 },
    );
  }
}
