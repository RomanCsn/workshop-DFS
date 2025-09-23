import { PrismaClient} from "@/generated/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { createPerformedService, getAllPerformedServices, updatePerformedService, deletePerformedService } from '@/utils/services';
import { z } from "zod";

const prisma = new PrismaClient();

// Zod validation schemas
const QueryParamsSchema = z.object({
  take: z.string().optional().transform((val) => val ? parseInt(val) : 100).pipe(z.number().min(1).max(1000)),
  skip: z.string().optional().transform((val) => val ? parseInt(val) : 0).pipe(z.number().min(0)),
});

const CreateServiceSchema = z.object({
  serviceType: z.enum(["CARE", "LESSON"]).default("LESSON"),
  billingId: z.string().uuid("billingId must be a valid UUID"),
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
    
    // Validate query parameters with Zod
    const validationResult = QueryParamsSchema.safeParse({
      take: searchParams.get('take'),
      skip: searchParams.get('skip'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { take, skip } = validationResult.data;
    const services = await getAllPerformedServices(take, skip);
    
    return NextResponse.json({ 
      success: true, 
      data: services 
    });
  } catch (error) {
    console.error('GET /api/services error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/services - Create a new performed service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body data with Zod
    const validationResult = CreateServiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const service = await createPerformedService(validatedData);
    
    return NextResponse.json({ 
      success: true, 
      data: service 
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/services error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/services - Update a performed service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body data with Zod
    const validationResult = UpdateServiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validationResult.data;
    const service = await updatePerformedService(id, updateData);
    
    return NextResponse.json({ 
      success: true, 
      data: service 
    });
  } catch (error) {
    console.error('PUT /api/services error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/services - Delete a performed service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validate the ID parameter with Zod
    const validationResult = DeleteServiceSchema.safeParse({ id });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or missing ID',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { id: validatedId } = validationResult.data;
    const service = await deletePerformedService(validatedId);
    
    return NextResponse.json({ 
      success: true, 
      data: service,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/services error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
