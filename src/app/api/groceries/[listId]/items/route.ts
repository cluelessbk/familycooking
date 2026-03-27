import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function verifyListOwnership(listId: string, householdId: string): Promise<boolean> {
  const list = await prisma.groceryList.findUnique({ where: { id: listId } });
  if (!list?.mealPlanId) return false;
  const plan = await prisma.mealPlan.findUnique({
    where: { id: list.mealPlanId },
    select: { householdId: true },
  });
  return plan?.householdId === householdId;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { listId } = await params;

  if (!(await verifyListOwnership(listId, householdId))) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.groceryItem.deleteMany({ where: { groceryListId: listId } });
  return Response.json({ ok: true });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { listId } = await params;

  if (!(await verifyListOwnership(listId, householdId))) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

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
