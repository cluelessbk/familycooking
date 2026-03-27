import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DeleteRecipeButton } from "./DeleteRecipeButton";
import { FlowchartSteps } from "@/components/recipes/flowchart-steps";
import { AddToMealPlanButton } from "@/components/recipes/AddToMealPlanButton";
import { BackButton } from "@/components/recipes/BackButton";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    notFound();
  }

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Back link */}
      <BackButton />

      {/* Title & actions */}
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          {recipe.category && (
            <span className="inline-block bg-secondary text-muted text-xs font-medium px-2 py-0.5 rounded-full">
              {recipe.category.name}
            </span>
          )}
          <h1 className="text-2xl font-bold text-foreground">{recipe.title}</h1>
        </div>
        <div className="flex gap-2 justify-center">
          <AddToMealPlanButton recipeId={id} />
          <Link
            href={`/recipes/${id}/edit`}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-border transition-colors"
          >
            Редактирай
          </Link>
          <DeleteRecipeButton id={id} />
        </div>
      </div>

      {/* Photo */}
      {recipe.photoUrl ? (
        <img
          src={recipe.photoUrl}
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-48 bg-secondary rounded-xl flex items-center justify-center">
          <span className="text-5xl">🍽️</span>
        </div>
      )}

      {/* Meta info */}
      <div className="space-y-3">
        {recipe.servings && (
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xs text-muted mb-1">Порции</p>
            <p className="font-semibold text-foreground">{recipe.servings}</p>
          </div>
        )}
        {(recipe.prepTime || recipe.cookTime) && (
          <div className="grid grid-cols-3 gap-3">
            {recipe.prepTime && (
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-xs text-muted mb-1">Подготовка</p>
                <p className="font-semibold text-foreground">{recipe.prepTime} мин</p>
              </div>
            )}
            {recipe.cookTime && (
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-xs text-muted mb-1">Готвене</p>
                <p className="font-semibold text-foreground">{recipe.cookTime} мин</p>
              </div>
            )}
            {totalTime > 0 && recipe.prepTime && recipe.cookTime && (
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-xs text-muted mb-1">Общо</p>
                <p className="font-semibold text-foreground">{totalTime} мин</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {recipe.description && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-2">За рецептата</h2>
          <p className="text-muted text-sm leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-3">Съставки</h2>
          <ul>
            {recipe.ingredients.map((ing, index) => (
              <li
                key={ing.id}
                className={[
                  "flex items-center justify-between py-2.5 text-sm",
                  index < recipe.ingredients.length - 1
                    ? "border-b border-secondary"
                    : "",
                ].join(" ")}
              >
                <span className="text-foreground font-medium">{ing.name}</span>
                {(ing.quantity || ing.unit) && (
                  <span className="text-muted text-[13px]">
                    {ing.quantity ? ing.quantity : ""}
                    {ing.unit ? ` ${ing.unit}` : ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      {recipe.steps.length > 0 && (
        <div>
          <h2 className="font-semibold text-foreground px-1 mb-3">Стъпки</h2>
          <FlowchartSteps steps={recipe.steps} />
        </div>
      )}
    </div>
  );
}
