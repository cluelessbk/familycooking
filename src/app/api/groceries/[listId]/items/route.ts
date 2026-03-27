import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params;
  await prisma.groceryItem.deleteMany({ where: { groceryListId: listId } });
  return Response.json({ ok: true });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params;
  const body = await request.json();
  const { name, quantity, unit } = body;

  if (!name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const item = await prisma.groceryItem.create({
    data: {
      groceryListId: listId,
      name: name.trim(),
      quantity: quantity ? Number(quantity) : null,
      unit: unit?.trim() || null,
      isManual: true,
      checked: false,
    },
  });

  return Response.json(item, { status: 201 });
}
