import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;

  const { token } = await params;

  const shareToken = await prisma.shareToken.findUnique({
    where: { token },
    include: {
      recipe: {
        include: {
          ingredients: true,
          steps: { orderBy: { stepNumber: "asc" } },
        },
      },
    },
  });

  if (!shareToken) {
    return Response.json({ error: "Invalid share token" }, { status: 404 });
  }

  const { recipe } = shareToken;

  // Guard: reject if the recipe already belongs to the recipient's household
  if (recipe.householdId === householdId) {
    return Response.json({ error: "Recipe already belongs to your household" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const categoryId: string | undefined = body.categoryId ?? undefined;

  // Copy recipe + ingredients + steps in a transaction
  const newRecipe = await prisma.$transaction(async (tx) => {
    const created = await tx.recipe.create({
      data: {
        title: recipe.title,
        description: recipe.description,
        photoUrl: recipe.photoUrl,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        householdId,
        categoryId: categoryId ?? null,
        ingredients: {
          create: recipe.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        },
        steps: {
          create: recipe.steps.map((step) => ({
            stepNumber: step.stepNumber,
            instruction: step.instruction,
          })),
        },
      },
    });
    return created;
  });

  return Response.json({ recipeId: newRecipe.id }, { status: 201 });
}
