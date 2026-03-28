"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowchartSteps } from "@/components/recipes/flowchart-steps";

interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  recipeId: string;
}

interface Step {
  id: string;
  stepNumber: number;
  instruction: string;
  recipeId: string;
}

interface Category {
  id: string;
  name: string;
  isPreset: boolean;
}

interface SharedRecipe {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  category: Category | null;
  ingredients: Ingredient[];
  steps: Step[];
}

interface SharedRecipeViewProps {
  recipe: SharedRecipe;
  token: string;
}

type UIState = "idle" | "selecting" | "loading" | "done" | "error";

interface CategoryOption {
  id: string;
  name: string;
}

export function SharedRecipeView({ recipe, token }: SharedRecipeViewProps) {
  const router = useRouter();
  const [uiState, setUiState] = useState<UIState>("idle");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  async function handleAddClick() {
    setUiState("loading");
    try {
      const res = await fetch("/api/categories");
      const data: CategoryOption[] = await res.json();
      setCategories(data);
      setSelectedCategoryId(data[0]?.id ?? "");
      setUiState("selecting");
    } catch {
      setErrorMsg("Грешка при зареждане на категориите.");
      setUiState("error");
    }
  }

  async function handleConfirm() {
    setUiState("loading");
    try {
      const res = await fetch(`/api/recipes/shared/${token}/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: selectedCategoryId || undefined }),
      });
      if (!res.ok) throw new Error("Failed to copy");
      const { recipeId } = await res.json();
      setUiState("done");
      setTimeout(() => router.push(`/recipes/${recipeId}`), 800);
    } catch {
      setErrorMsg("Грешка при добавяне на рецептата. Опитай отново.");
      setUiState("error");
    }
  }

  function handleCancel() {
    setUiState("idle");
    setErrorMsg("");
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-medium">
        Споделена рецепта — можеш да я добавиш в твоето домакинство
      </div>

      {/* Title & category */}
      <div className="space-y-1">
        {recipe.category && (
          <span className="inline-block bg-secondary text-muted text-xs font-medium px-2 py-0.5 rounded-full">
            {recipe.category.name}
          </span>
        )}
        <h1 className="text-2xl font-bold text-foreground">{recipe.title}</h1>
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

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border px-4 py-4 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto">
          {uiState === "idle" && (
            <button
              type="button"
              onClick={handleAddClick}
              className="w-full bg-primary text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Добави в моите рецепти
            </button>
          )}

          {uiState === "selecting" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Избери категория
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— Без категория —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Добави
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-secondary text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-border transition-colors"
                >
                  Отказ
                </button>
              </div>
            </div>
          )}

          {uiState === "loading" && (
            <div className="w-full bg-secondary text-muted rounded-lg px-4 py-3 text-sm font-medium text-center">
              Зареждане...
            </div>
          )}

          {uiState === "done" && (
            <div className="w-full bg-primary/10 text-primary rounded-lg px-4 py-3 text-sm font-medium text-center">
              Добавено! Пренасочване...
            </div>
          )}

          {uiState === "error" && (
            <div className="space-y-2">
              <p className="text-sm text-center text-red-500">{errorMsg}</p>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-secondary text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-border transition-colors"
              >
                Назад
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
