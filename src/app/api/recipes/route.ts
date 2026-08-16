import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { COOKING_METHODS } from "@/lib/cooking-methods";

const validMethodIds = new Set<string>(COOKING_METHODS.map((method) => method.id));

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const categoryId = request.nextUrl.searchParams.get("categoryId");
  const cookingMethods = request.nextUrl.searchParams.get("methods")?.split(",").filter(Boolean) ?? [];

  const recipes = await prisma.recipe.findMany({
    where: {
      householdId,
      ...(categoryId ? { categoryId } : {}),
      ...(cookingMethods.length ? { cookingMethods: { some: { cookingMethodId: { in: cookingMethods } } } } : {}),
    },
    include: { category: true, cookingMethods: { include: { cookingMethod: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(recipes);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const body = await request.json();
  const { title, description, photoUrl, categoryId, servings, prepTime, cookTime, cookingMethodIds = [], ingredients, steps } = body;

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }
  if (!Array.isArray(cookingMethodIds) || cookingMethodIds.some((id) => typeof id !== "string" || !validMethodIds.has(id))) {
    return Response.json({ error: "Invalid cooking methods" }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      title,
      householdId,
      description: description ?? null,
      photoUrl: photoUrl ?? null,
      categoryId: categoryId ?? null,
      servings: servings ? Number(servings) : null,
      prepTime: prepTime ? Number(prepTime) : null,
      cookTime: cookTime ? Number(cookTime) : null,
      airFryerSuitable: cookingMethodIds.includes("air-fryer"),
      cookingMethods: {
        create: cookingMethodIds.map((cookingMethodId: string) => ({ cookingMethodId })),
      },
      ingredients: {
        create: (ingredients ?? []).map((ing: { name: string; quantity?: number; unit?: string }) => ({
          name: ing.name,
          quantity: ing.quantity ? Number(ing.quantity) : null,
          unit: ing.unit ?? null,
        })),
      },
      steps: {
        create: (steps ?? []).map((step: { stepNumber: number; instruction: string }) => ({
          stepNumber: step.stepNumber,
          instruction: step.instruction,
        })),
      },
    },
    include: { category: true, ingredients: true, steps: true, cookingMethods: { include: { cookingMethod: true } } },
  });

  return Response.json(recipe, { status: 201 });
}
