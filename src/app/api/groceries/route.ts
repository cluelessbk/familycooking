import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get("week");

  if (!week) {
    return Response.json({ error: "week param required (YYYY-MM-DD)" }, { status: 400 });
  }

  const weekStart = new Date(week);
  weekStart.setUTCHours(0, 0, 0, 0);

  const plan = await prisma.mealPlan.findUnique({ where: { weekStart } });
  if (!plan) {
    return Response.json({ list: null, items: [] });
  }

  const list = await prisma.groceryList.findUnique({ where: { mealPlanId: plan.id } });
  if (!list) {
    return Response.json({ list: null, items: [] });
  }

  const items = await prisma.groceryItem.findMany({
    where: { groceryListId: list.id },
    orderBy: { name: "asc" },
  });

  return Response.json({ list, items });
}
