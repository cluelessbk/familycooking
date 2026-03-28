import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SharedRecipeView } from "@/components/recipes/SharedRecipeView";

export default async function SharedRecipePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const session = await auth();
  if (!session?.user?.householdId) {
    redirect(`/signin?callbackUrl=/recipes/shared/${token}`);
  }

  const shareToken = await prisma.shareToken.findUnique({
    where: { token },
    include: {
      recipe: {
        include: {
          category: true,
          ingredients: true,
          steps: { orderBy: { stepNumber: "asc" } },
        },
      },
    },
  });

  if (!shareToken) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="bg-card border border-border rounded-xl p-8 text-center max-w-sm w-full">
          <p className="text-2xl mb-3">🔗</p>
          <h1 className="font-bold text-foreground text-lg mb-2">Невалидна връзка</h1>
          <p className="text-muted text-sm">Тази споделена рецепта не съществува или е изтрита.</p>
          <Link
            href="/recipes"
            className="mt-5 inline-block bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Към рецептите
          </Link>
        </div>
      </div>
    );
  }

  const { recipe } = shareToken;

  // Recipe already belongs to the viewer's household
  if (recipe.householdId === session.user.householdId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="bg-card border border-border rounded-xl p-8 text-center max-w-sm w-full">
          <p className="text-2xl mb-3">✅</p>
          <h1 className="font-bold text-foreground text-lg mb-2">Рецептата е твоя!</h1>
          <p className="text-muted text-sm mb-5">Тази рецепта вече е в твоето домакинство.</p>
          <Link
            href={`/recipes/${recipe.id}`}
            className="inline-block bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Виж рецептата
          </Link>
        </div>
      </div>
    );
  }

  // Serialize dates to avoid passing non-plain objects to client component
  const plainRecipe = {
    ...recipe,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
    category: recipe.category
      ? { id: recipe.category.id, name: recipe.category.name, isPreset: recipe.category.isPreset }
      : null,
    ingredients: recipe.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      recipeId: ing.recipeId,
    })),
    steps: recipe.steps.map((step) => ({
      id: step.id,
      stepNumber: step.stepNumber,
      instruction: step.instruction,
      recipeId: step.recipeId,
    })),
  };

  return <SharedRecipeView recipe={plainRecipe} token={token} />;
}
