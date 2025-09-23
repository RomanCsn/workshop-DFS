import { PrismaClient, PerformedService, Prisma } from "@/generated/prisma";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

/* --------- CRUD --------- */

export async function createPerformedService(
  data: Prisma.PerformedServiceCreateInput
): Promise<PerformedService> {
  try {
    return await prisma.performedService.create({ data });
  } catch (err) {
    console.error('createPerformedService error:', err);
    throw new Error('Échec de la création du service.');
  }
}

export async function getAllPerformedServices(
  take = 100,
  skip = 0
): Promise<PerformedService[]> {
  try {
    return await prisma.performedService.findMany({
      take,
      skip,
      orderBy: { id: 'desc' },
    });
  } catch (err) {
    console.error('getAllPerformedServices error:', err);
    throw new Error("Impossible de récupérer la liste des services.");
  }
}

export async function getPerformedServiceById(
  id: string
): Promise<PerformedService | null> {
  try {
    return await prisma.performedService.findUnique({ where: { id } });
  } catch (err) {
    console.error('getPerformedServiceById error:', err);
    throw new Error("Erreur lors de la récupération du service par id.");
  }
}

export async function updatePerformedService(
  id: string,
  data: Prisma.PerformedServiceUpdateInput
): Promise<PerformedService> {
  try {
    return await prisma.performedService.update({ where: { id }, data });
  } catch (err) {
    console.error('updatePerformedService error:', err);
    throw new Error("Échec de la mise à jour du service.");
  }
}

export async function deletePerformedService(
  id: string
): Promise<PerformedService> {
  try {
    return await prisma.performedService.delete({ where: { id } });
  } catch (err) {
    console.error('deletePerformedService error:', err);
    throw new Error("Échec de la suppression du service.");
  }
}

/* --------- HTTP METHODS --------- */

// GET /api/services - Get all performed services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const take = parseInt(searchParams.get('take') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

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
    const service = await createPerformedService(body);
    
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
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID is required for update' 
        },
        { status: 400 }
      );
    }

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
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID is required for deletion' 
        },
        { status: 400 }
      );
    }

    const service = await deletePerformedService(id);
    
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
