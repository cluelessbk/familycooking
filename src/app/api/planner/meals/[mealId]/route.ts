import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ mealId: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { mealId } = await params;

  // Verify ownership via mealPlan
  const meal = await prisma.plannedMeal.findUnique({
    where: { id: mealId },
    include: { mealPlan: { select: { householdId: true } } },
  });
  if (!meal || meal.mealPlan.householdId !== householdId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.plannedMeal.delete({ where: { id: mealId } });

  return Response.json({ ok: true });
}
