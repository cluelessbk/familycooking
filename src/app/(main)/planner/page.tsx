"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Slot = { id: string; name: string; sortOrder: number };
type Recipe = { id: string; title: string };
type Meal = { id: string; date: string; mealSlotId: string; recipe: Recipe };
type PlanData = { plan: { id: string }; meals: Meal[]; slots: Slot[] };

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("bg-BG", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", timeZone: "UTC" };
  return `${monday.toLocaleDateString("bg-BG", opts)} – ${sunday.toLocaleDateString("bg-BG", opts)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const [weekMonday, setWeekMonday] = useState<Date>(() => getMondayOf(new Date()));
  const [data, setData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [picker, setPicker] = useState<{ date: string; slotId: string } | null>(null);
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch week data whenever the week changes
  const loadWeek = useCallback(async (monday: Date) => {
    setLoading(true);
    const res = await fetch(`/api/planner?week=${toISODate(monday)}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWeek(weekMonday);
  }, [weekMonday, loadWeek]);

  // Fetch recipes once for the picker
  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then(setRecipes);
  }, []);

  function prevWeek() {
    setWeekMonday((m) => addDays(m, -7));
  }

  function nextWeek() {
    setWeekMonday((m) => addDays(m, 7));
  }

  function goToday() {
    setWeekMonday(getMondayOf(new Date()));
  }

  async function assignRecipe(recipeId: string) {
    if (!picker || !data) return;
    await fetch("/api/planner/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealPlanId: data.plan.id,
        date: picker.date,
        mealSlotId: picker.slotId,
        recipeId,
      }),
    });
    setPicker(null);
    setSearch("");
    await loadWeek(weekMonday);
  }

  async function removeMeal(mealId: string) {
    setRemovingId(mealId);
    await fetch(`/api/planner/meals/${mealId}`, { method: "DELETE" });
    setRemovingId(null);
    await loadWeek(weekMonday);
  }

  const todayStr = toISODate(getMondayOf(new Date()) === weekMonday ? new Date() : new Date(0));
  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  // Build 7-day array for the week
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekMonday, i));

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={prevWeek}
          className="p-2 rounded-lg border border-border hover:border-primary transition-colors text-foreground"
          aria-label="Previous week"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-foreground">{formatWeekRange(weekMonday)}</h1>
          <button
            onClick={goToday}
            className="text-xs text-primary hover:underline mt-0.5"
          >
            Тази седмица
          </button>
        </div>
        <button
          onClick={nextWeek}
          className="p-2 rounded-lg border border-border hover:border-primary transition-colors text-foreground"
          aria-label="Next week"
        >
          →
        </button>
      </div>

      {/* Planner grid */}
      {loading ? (
        <p className="text-center text-muted py-12">Зареждане…</p>
      ) : data ? (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 text-sm font-medium text-muted w-28">Ден</th>
                {data.slots.map((slot) => (
                  <th key={slot.id} className="text-center py-2 px-2 text-sm font-medium text-muted">
                    {slot.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const dateStr = toISODate(day);
                const isToday = dateStr === toISODate(new Date());
                return (
                  <tr key={dateStr} className={isToday ? "bg-primary/5" : ""}>
                    <td className="py-2 pr-3 text-sm font-medium text-foreground whitespace-nowrap">
                      {formatDay(day)}
                      {isToday && (
                        <span className="ml-1 text-xs text-primary font-normal">днес</span>
                      )}
                    </td>
                    {data.slots.map((slot) => {
                      const slotMeals = data.meals.filter(
                        (m) => m.mealSlotId === slot.id && m.date.slice(0, 10) === dateStr
                      );
                      return (
                        <td key={slot.id} className="py-1.5 px-2 align-top">
                          <div className="flex flex-col gap-1">
                            {slotMeals.map((meal) => (
                              <div key={meal.id} className="flex items-center gap-1 bg-card border border-border rounded-lg px-2 py-1.5">
                                <a
                                  href={`/recipes/${meal.recipe.id}`}
                                  className="text-xs text-foreground hover:text-primary flex-1 leading-tight line-clamp-2"
                                >
                                  {meal.recipe.title}
                                </a>
                                <button
                                  onClick={() => removeMeal(meal.id)}
                                  disabled={removingId === meal.id}
                                  className="shrink-0 text-muted hover:text-red-500 transition-colors text-sm leading-none"
                                  aria-label="Remove"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => setPicker({ date: dateStr, slotId: slot.id })}
                              className="w-full h-7 flex items-center justify-center rounded-lg border border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors text-lg leading-none"
                              aria-label={`Add recipe for ${slot.name} on ${dateStr}`}
                            >
                              +
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Recipe picker modal */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => { setPicker(null); setSearch(""); }}
        >
          <div
            className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground mb-3">Избери рецепта</h2>
              <input
                type="text"
                placeholder="Търси…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {filteredRecipes.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted">Няма намерени рецепти</li>
              ) : (
                filteredRecipes.map((recipe) => (
                  <li key={recipe.id}>
                    <button
                      onClick={() => assignRecipe(recipe.id)}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-primary/10 transition-colors"
                    >
                      {recipe.title}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="p-3 border-t border-border flex gap-2">
              <a
                href="/recipes/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm text-primary border border-primary rounded-lg py-2 hover:bg-primary/10 transition-colors"
              >
                + Нова рецепта
              </a>
              <button
                onClick={() => { setPicker(null); setSearch(""); }}
                className="flex-1 text-sm text-muted hover:text-foreground transition-colors py-2 border border-border rounded-lg"
              >
                Затвори
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
