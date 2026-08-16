export const COOKING_METHODS = [
  { id: "air-fryer", name: "Еър фрайър", icon: "♨️", color: "teal" },
  { id: "pressure-cooker", name: "Тенджера под налягане", icon: "🍲", color: "violet" },
] as const;

export type CookingMethodId = (typeof COOKING_METHODS)[number]["id"];

export function cookingMethodBadgeClass(color: string) {
  return color === "violet"
    ? "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300"
    : "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300";
}
