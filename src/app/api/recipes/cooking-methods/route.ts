import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { COOKING_METHODS } from "@/lib/cooking-methods";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.householdId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const assignments = body?.assignments as Record<string, unknown> | undefined;
  const methodIds = COOKING_METHODS.map((method) => method.id);
  if (!assignments || methodIds.some((id) => !Array.isArray(assignments[id]) || (assignments[id] as unknown[]).some((recipeId) => typeof recipeId !== "string"))) {
    return Response.json({ error: "Invalid assignments" }, { status: 400 });
  }

  const requestedRecipeIds = [...new Set(methodIds.flatMap((id) => assignments[id] as string[]))];
  const ownedRecipeIds = await prisma.recipe.findMany({
    where: { householdId: session.user.householdId, id: { in: requestedRecipeIds } },
    select: { id: true },
  });
  if (ownedRecipeIds.length !== requestedRecipeIds.length) return Response.json({ error: "Invalid recipe" }, { status: 400 });

  const householdRecipes = await prisma.recipe.findMany({
    where: { householdId: session.user.householdId },
    select: { id: true },
  });
  const householdRecipeIds = householdRecipes.map((recipe) => recipe.id);
  const rows = methodIds.flatMap((cookingMethodId) =>
    (assignments[cookingMethodId] as string[]).map((recipeId) => ({ recipeId, cookingMethodId }))
  );
  const airFryerIds = assignments["air-fryer"] as string[];

  await prisma.$transaction([
    prisma.recipeCookingMethod.deleteMany({ where: { recipeId: { in: householdRecipeIds }, cookingMethodId: { in: methodIds } } }),
    prisma.recipeCookingMethod.createMany({ data: rows }),
    prisma.recipe.updateMany({ where: { id: { in: householdRecipeIds } }, data: { airFryerSuitable: false } }),
    prisma.recipe.updateMany({ where: { id: { in: airFryerIds } }, data: { airFryerSuitable: true } }),
  ]);

  return Response.json({ success: true });
}
