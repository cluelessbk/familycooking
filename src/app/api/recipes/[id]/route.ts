import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  return Response.json(recipe);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, description, categoryId, servings, prepTime, cookTime, ingredients, steps } = body;

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  // Delete old ingredients and steps, then recreate (simplest approach)
  await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
  await prisma.recipeStep.deleteMany({ where: { recipeId: id } });

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      title,
      description: description ?? null,
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
  const { id } = await params;

  await prisma.recipe.delete({ where: { id } });

  return Response.json({ success: true });
}
