import { COOKING_METHODS } from "@/lib/cooking-methods";

type IngredientInput = { name: string; quantity?: number | string | null; unit?: string | null };
type StepInput = { stepNumber?: number; instruction: string };

export type RecipePayload = {
  title: string;
  description?: string | null;
  photoUrl?: string | null;
  categoryId?: string | null;
  servings?: number | string | null;
  prepTime?: number | string | null;
  cookTime?: number | string | null;
  airFryerSuitable?: boolean;
  cookingMethodIds?: string[];
  ingredients?: IngredientInput[];
  steps?: StepInput[];
};

function optionalNumber(value: number | string | null | undefined, field: string) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${field} must be a non-negative number`);
  return number;
}

export function validateRecipePayload(value: unknown): RecipePayload {
  if (!value || typeof value !== "object") throw new Error("A JSON object is required");
  const payload = value as RecipePayload;
  if (typeof payload.title !== "string" || !payload.title.trim()) throw new Error("Title is required");
  if (payload.ingredients !== undefined && !Array.isArray(payload.ingredients)) throw new Error("Ingredients must be an array");
  if (payload.steps !== undefined && !Array.isArray(payload.steps)) throw new Error("Steps must be an array");
  const validMethodIds = new Set<string>(COOKING_METHODS.map((method) => method.id));
  if (payload.cookingMethodIds !== undefined && (!Array.isArray(payload.cookingMethodIds) || payload.cookingMethodIds.some((id) => typeof id !== "string" || !validMethodIds.has(id)))) {
    throw new Error("Invalid cooking methods");
  }
  if (payload.ingredients?.some((item) => !item || typeof item.name !== "string" || !item.name.trim())) {
    throw new Error("Every ingredient requires a name");
  }
  if (payload.steps?.some((item) => !item || typeof item.instruction !== "string" || !item.instruction.trim())) {
    throw new Error("Every step requires an instruction");
  }
  optionalNumber(payload.servings, "Servings");
  optionalNumber(payload.prepTime, "Prep time");
  optionalNumber(payload.cookTime, "Cook time");
  return payload;
}

export function recipeData(payload: RecipePayload, title = payload.title.trim()) {
  const cookingMethodIds = payload.cookingMethodIds ?? (payload.airFryerSuitable ? ["air-fryer"] : []);
  return {
    title,
    description: payload.description?.trim() || null,
    photoUrl: payload.photoUrl?.trim() || null,
    categoryId: payload.categoryId || null,
    servings: optionalNumber(payload.servings, "Servings"),
    prepTime: optionalNumber(payload.prepTime, "Prep time"),
    cookTime: optionalNumber(payload.cookTime, "Cook time"),
    airFryerSuitable: cookingMethodIds.includes("air-fryer"),
    cookingMethods: { create: cookingMethodIds.map((cookingMethodId) => ({ cookingMethodId })) },
    ingredients: {
      create: (payload.ingredients ?? []).map((ingredient) => ({
        name: ingredient.name.trim(),
        quantity: optionalNumber(ingredient.quantity, "Ingredient quantity"),
        unit: ingredient.unit?.trim() || null,
      })),
    },
    steps: {
      create: (payload.steps ?? []).map((step, index) => ({
        stepNumber: step.stepNumber ?? index + 1,
        instruction: step.instruction.trim(),
      })),
    },
  };
}

export const fullRecipeInclude = {
  category: true,
  ingredients: true,
  steps: { orderBy: { stepNumber: "asc" as const } },
  cookingMethods: { include: { cookingMethod: true } },
};
