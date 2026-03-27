import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const categoryId = request.nextUrl.searchParams.get("categoryId");

  const recipes = await prisma.recipe.findMany({
    where: {
      householdId,
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: true },
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
  const { title, description, photoUrl, categoryId, servings, prepTime, cookTime, ingredients, steps } = body;

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
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

  return Response.json(recipe, { status: 201 });
}
