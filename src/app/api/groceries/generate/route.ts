import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const body = await request.json();
  const { week } = body;

  if (!week) {
    return Response.json({ error: "week is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const weekStart = new Date(week);
  weekStart.setUTCHours(0, 0, 0, 0);

  // Get or create the meal plan for this week + household
  let plan = await prisma.mealPlan.findUnique({
    where: { weekStart_householdId: { weekStart, householdId } },
  });
  if (!plan) {
    plan = await prisma.mealPlan.create({ data: { weekStart, householdId } });
  }

  // Get or create the grocery list tied to this plan
  let list = await prisma.groceryList.findUnique({ where: { mealPlanId: plan.id } });
  if (!list) {
    list = await prisma.groceryList.create({ data: { mealPlanId: plan.id } });
  }

  // Fetch all planned meals with their recipe ingredients
  const plannedMeals = await prisma.plannedMeal.findMany({
    where: { mealPlanId: plan.id },
    include: {
      recipe: {
        include: { ingredients: true },
      },
    },
  });

  // Flatten and merge ingredients by (name, unit)
  const mergeMap = new Map<string, { name: string; quantity: number | null; unit: string | null }>();

  for (const meal of plannedMeals) {
    for (const ing of meal.recipe.ingredients) {
      const key = `${ing.name.toLowerCase().trim()}|${(ing.unit ?? "").toLowerCase().trim()}`;
      const existing = mergeMap.get(key);
      if (existing) {
        if (existing.quantity !== null && ing.quantity !== null) {
          existing.quantity += ing.quantity;
        } else {
          existing.quantity = null; // can't sum if either side is missing
        }
      } else {
        mergeMap.set(key, {
          name: ing.name.trim(),
          quantity: ing.quantity,
          unit: ing.unit,
        });
      }
    }
  }

  // Delete old auto-generated items, keep manual ones
  await prisma.groceryItem.deleteMany({
    where: { groceryListId: list.id, isManual: false },
  });

  // Create merged items
  if (mergeMap.size > 0) {
    await prisma.groceryItem.createMany({
      data: Array.from(mergeMap.values()).map((item) => ({
        groceryListId: list.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        checked: false,
        isManual: false,
      })),
    });
  }

  const items = await prisma.groceryItem.findMany({
    where: { groceryListId: list.id },
    orderBy: { name: "asc" },
  });

  return Response.json({ list, items });
}
