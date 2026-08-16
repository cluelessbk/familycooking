"use client";

import { useEffect, useMemo, useState } from "react";

interface RecipeOption {
  id: string;
  title: string;
  airFryerSuitable: boolean;
}

interface AirFryerRecipePickerProps {
  onSaved: () => void;
  prominent?: boolean;
}

export function AirFryerRecipePicker({ onSaved, prominent = false }: AirFryerRecipePickerProps) {
  const [open, setOpen] = useState(false);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, saving]);

  async function handleOpen() {
    setOpen(true);
    setLoading(true);
    setError("");
    setSearch("");

    try {
      const response = await fetch("/api/recipes");
      if (!response.ok) throw new Error();
      const data: RecipeOption[] = await response.json();
      setRecipes(data);
      setSelectedIds(new Set(data.filter((recipe) => recipe.airFryerSuitable).map((recipe) => recipe.id)));
    } catch {
      setError("Рецептите не можаха да се заредят.");
    } finally {
      setLoading(false);
    }
  }

  function toggleRecipe(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/recipes/air-fryer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeIds: [...selectedIds] }),
      });
      if (!response.ok) throw new Error();
      setOpen(false);
      onSaved();
    } catch {
      setError("Промените не можаха да се запазят.");
    } finally {
      setSaving(false);
    }
  }

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("bg");
    if (!query) return recipes;
    return recipes.filter((recipe) => recipe.title.toLocaleLowerCase("bg").includes(query));
  }, [recipes, search]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={prominent
          ? "bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
          : "flex-1 sm:flex-none border border-primary text-primary rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors"
        }
      >
        + Добави към Еър фрайър
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => { if (!saving) setOpen(false); }}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="air-fryer-picker-title"
            className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 id="air-fryer-picker-title" className="font-semibold text-foreground">
                    Еър фрайър рецепти
                  </h2>
                  <p className="text-xs text-muted mt-0.5">Избрани: {selectedIds.size}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="text-muted hover:text-foreground text-lg leading-none disabled:opacity-50"
                  aria-label="Затвори"
                >
                  ✕
                </button>
              </div>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Търси рецепта…"
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                autoFocus
              />
            </div>

            <div className="max-h-[55vh] overflow-y-auto divide-y divide-border">
              {loading ? (
                <p className="px-4 py-8 text-center text-sm text-muted">Зареждане...</p>
              ) : filteredRecipes.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  {recipes.length === 0 ? "Все още няма създадени рецепти." : "Няма намерени рецепти."}
                </p>
              ) : (
                filteredRecipes.map((recipe) => (
                  <label
                    key={recipe.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(recipe.id)}
                      onChange={() => toggleRecipe(recipe.id)}
                      className="h-5 w-5 accent-primary shrink-0"
                    />
                    <span className="text-sm text-foreground">{recipe.title}</span>
                  </label>
                ))
              )}
            </div>

            {error && <p className="px-4 pt-3 text-sm text-accent">{error}</p>}

            <div className="p-4 border-t border-border flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="flex-1 border border-border rounded-lg py-2.5 text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                Отказ
              </button>
              <button
                type="button"
                onClick={save}
                disabled={loading || saving || recipes.length === 0}
                className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Запазване..." : "Запази"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
