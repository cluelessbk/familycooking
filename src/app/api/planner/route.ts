import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const week = request.nextUrl.searchParams.get("week");

  if (!week) {
    return Response.json({ error: "week param required (YYYY-MM-DD)" }, { status: 400 });
  }

  const weekStart = new Date(week);
  weekStart.setUTCHours(0, 0, 0, 0);

  // Get or create the MealPlan for this week + household
  let plan = await prisma.mealPlan.findUnique({
    where: { weekStart_householdId: { weekStart, householdId } },
  });
  if (!plan) {
    plan = await prisma.mealPlan.create({ data: { weekStart, householdId } });
  }

  const [meals, slots] = await Promise.all([
    prisma.plannedMeal.findMany({
      where: { mealPlanId: plan.id },
      include: { recipe: { select: { id: true, title: true } } },
    }),
    prisma.mealSlot.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return Response.json({ plan, meals, slots });
}
