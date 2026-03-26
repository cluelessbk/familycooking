import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { mealPlanId, date, mealSlotId, recipeId } = body;

  if (!mealPlanId || !date || !mealSlotId || !recipeId) {
    return Response.json({ error: "mealPlanId, date, mealSlotId, recipeId are required" }, { status: 400 });
  }

  const parsedDate = new Date(date);
  parsedDate.setUTCHours(0, 0, 0, 0);

  const meal = await prisma.plannedMeal.create({
    data: { mealPlanId, date: parsedDate, mealSlotId, recipeId },
    include: { recipe: { select: { id: true, title: true } } },
  });

  return Response.json(meal, { status: 201 });
}
