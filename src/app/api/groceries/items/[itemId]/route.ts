import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const { checked } = await request.json();

  const item = await prisma.groceryItem.update({
    where: { id: itemId },
    data: { checked },
  });

  return Response.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;

  await prisma.groceryItem.delete({ where: { id: itemId } });

  return Response.json({ ok: true });
}
