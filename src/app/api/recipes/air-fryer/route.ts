import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (
    !body ||
    !Array.isArray(body.recipeIds) ||
    body.recipeIds.some((id: unknown) => typeof id !== "string")
  ) {
    return Response.json({ error: "recipeIds must be an array of strings" }, { status: 400 });
  }

  const householdId = session.user.householdId;
  const recipeIds = [...new Set<string>(body.recipeIds)];

  await prisma.$transaction([
    prisma.recipe.updateMany({
      where: { householdId, airFryerSuitable: true },
      data: { airFryerSuitable: false },
    }),
    prisma.recipe.updateMany({
      where: { householdId, id: { in: recipeIds } },
      data: { airFryerSuitable: true },
    }),
  ]);

  const selectedCount = await prisma.recipe.count({
    where: { householdId, airFryerSuitable: true },
  });

  return Response.json({ success: true, selectedCount });
}
