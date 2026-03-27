import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function verifyItemOwnership(itemId: string, householdId: string): Promise<boolean> {
  const item = await prisma.groceryItem.findUnique({
    where: { id: itemId },
    select: { groceryListId: true },
  });
  if (!item) return false;
  const list = await prisma.groceryList.findUnique({
    where: { id: item.groceryListId },
    select: { mealPlanId: true },
  });
  if (!list?.mealPlanId) return false;
  const plan = await prisma.mealPlan.findUnique({
    where: { id: list.mealPlanId },
    select: { householdId: true },
  });
  return plan?.householdId === householdId;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { itemId } = await params;

  if (!(await verifyItemOwnership(itemId, householdId))) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

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
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { itemId } = await params;

  if (!(await verifyItemOwnership(itemId, householdId))) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.groceryItem.delete({ where: { id: itemId } });

  return Response.json({ ok: true });
}
