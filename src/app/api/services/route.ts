import { NextRequest, NextResponse } from "next/server";
import {
  createPerformedService,
  getAllPerformedServices,
  updatePerformedService,
  deletePerformedService,
} from "@/utils/services";
import { createBilling } from "@/utils/billing";
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

const QueryParamsSchema = z.object({
  take: parseQueryNumber(100).refine((n) => n >= 1 && n <= 1000, {
    message: "take must be between 1 and 1000",
  }),
  skip: parseQueryNumber(0).refine((n) => n >= 0, {
    message: "skip must be >= 0",
  }),
});

// Body schemas
const CreateServiceSchema = z.object({
  serviceType: z.enum(["CARE", "LESSON"]).default("LESSON"),
  billingId: z.string().uuid("billingId must be a valid UUID").optional(),
  userId: z.string().uuid("userId must be a valid UUID"),
  serviceId: z.string().uuid("serviceId must be a valid UUID"),
  amount: z.number().min(0, "Amount must be positive").default(0),
}); 

const UpdateServiceSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
  serviceType: z.enum(["CARE", "LESSON"]).optional(),
  billingId: z.string().uuid("billingId must be a valid UUID").optional(),
  userId: z.string().uuid("userId must be a valid UUID").optional(),
  serviceId: z.string().uuid("serviceId must be a valid UUID").optional(),
  amount: z.number().min(0, "Amount must be positive").optional(),
});

const DeleteServiceSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});

// GET /api/services - Get all performed services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // safeParse reçoit string | null — notre preprocess gère null ''
    const validationResult = QueryParamsSchema.safeParse({
      take: searchParams.get("take"),
      skip: searchParams.get("skip"),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { take, skip } = validationResult.data;
    const services = await getAllPerformedServices(take, skip);

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// POST /api/services - Create a new performed service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = CreateServiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const validatedData = validationResult.data;

    let billingId = validatedData.billingId;
    if (!billingId) {
      const billing = await createBilling({ date: new Date(), services: { create: [] } });
      billingId = billing.id;
    }

    const service = await createPerformedService({
      serviceType: validatedData.serviceType,
      billing: { connect: { id: billingId } },
      user: { connect: { id: validatedData.userId } },
      lesson: { connect: { id: validatedData.serviceId } },
      amount: validatedData.amount ?? 0,
    });
    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// PUT /api/services - Update a performed service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = UpdateServiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { id, ...updateData } = validationResult.data;
    const service = await updatePerformedService(id, updateData);

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("PUT /api/services error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/services - Delete a performed service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const validationResult = DeleteServiceSchema.safeParse({ id });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing ID",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { id: validatedId } = validationResult.data;
    const service = await deletePerformedService(validatedId);

    return NextResponse.json({
      success: true,
      data: service,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/services error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
