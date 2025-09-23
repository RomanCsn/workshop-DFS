import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

//GET POUR RECUP LES CHEVAUX
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return new Response("Il n'y a pas d'ownerId :/", { status: 400 });
  }

  const horses = await prisma.horse.findMany({
    where: {
      ownerId,
    },
  });
  return Response.json(horses);
}

//PUT POUR CREER UN CHEVAL
export async function PUT(request: Request) {
  const body = await request.json();
  const name = body?.name;
  const ownerId = body?.ownerId;

  if (!ownerId) {
    return new Response("Il n'y a pas d'ownerId :/", { status: 400 });
  }

  const horse = await prisma.horse.create({
    data: {
      name: name ?? null,
      ownerId,
    },
  });
  return Response.json(horse);
}

//PATCH POUR MODIFIER UN CHEVAL
export async function PATCH(request: Request) {
  const body = await request.json();
  const id = body?.id;
  const name = body?.name;
  const ownerId = body?.ownerId;

  if (!id) {
    return new Response("pas d'id", { status: 400 });
  }

  const horse = await prisma.horse.update({
    where: { id },
    data: { name, ownerId },
  });
  return Response.json(horse);
}

//DELETE POUR SUPPRIMER UN CHEVAL
export async function DELETE(request: Request) {
  const body = await request.json();
  const id = body?.id;
  if (!id) {
    return new Response("Il n'y a pas d'id de cheval :/", { status: 400 });
  }
  const horse = await prisma.horse.delete({
    where: { id },
  });
  return Response.json(horse);
}