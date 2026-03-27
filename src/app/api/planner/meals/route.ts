import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const body = await request.json();
  const { mealPlanId, date, mealSlotId, recipeId } = body;

  if (!mealPlanId || !date || !mealSlotId || !recipeId) {
    return Response.json({ error: "mealPlanId, date, mealSlotId, recipeId are required" }, { status: 400 });
  }

  // Verify the mealPlan belongs to this household
  const plan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    select: { householdId: true },
  });
  if (!plan || plan.householdId !== householdId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const parsedDate = new Date(date);
  parsedDate.setUTCHours(0, 0, 0, 0);

  const meal = await prisma.plannedMeal.create({
    data: { mealPlanId, date: parsedDate, mealSlotId, recipeId },
    include: { recipe: { select: { id: true, title: true } } },
  });

  return Response.json(meal, { status: 201 });
}
