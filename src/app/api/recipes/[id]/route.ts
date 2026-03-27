import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      category: true,
      ingredients: true,
      steps: { orderBy: { stepNumber: "asc" } },
    },
  });

  if (!recipe) {
    return Response.json({ error: "Recipe not found" }, { status: 404 });
  }

  if (recipe.householdId !== householdId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(recipe);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { id } = await params;
  const body = await request.json();
  const { title, description, photoUrl, categoryId, servings, prepTime, cookTime, ingredients, steps } = body;

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const existing = await prisma.recipe.findUnique({ where: { id }, select: { householdId: true } });
  if (!existing || existing.householdId !== householdId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Delete old ingredients and steps, then recreate (simplest approach)
  await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
  await prisma.recipeStep.deleteMany({ where: { recipeId: id } });

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      title,
      description: description ?? null,
      photoUrl: photoUrl ?? null,
      categoryId: categoryId ?? null,
      servings: servings ? Number(servings) : null,
      prepTime: prepTime ? Number(prepTime) : null,
      cookTime: cookTime ? Number(cookTime) : null,
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
    include: { category: true, ingredients: true, steps: true },
  });

  return Response.json(recipe);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { id } = await params;

  const existing = await prisma.recipe.findUnique({ where: { id }, select: { householdId: true } });
  if (!existing || existing.householdId !== householdId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.recipe.delete({ where: { id } });

  return Response.json({ success: true });
}
