"use client";

import { useEffect, useMemo, useState } from "react";
import { COOKING_METHODS, cookingMethodBadgeClass } from "@/lib/cooking-methods";

interface RecipeOption {
  id: string;
  title: string;
  cookingMethods: { cookingMethod: { id: string } }[];
}

export function CookingMethodManager({ onSaved, prominent = false }: { onSaved: () => void; prominent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [activeMethodId, setActiveMethodId] = useState<string>(COOKING_METHODS[0].id);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [selectedByMethod, setSelectedByMethod] = useState<Record<string, Set<string>>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && !saving && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
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
      setSelectedByMethod(Object.fromEntries(COOKING_METHODS.map((method) => [
        method.id,
        new Set(data.filter((recipe) => recipe.cookingMethods.some((item) => item.cookingMethod.id === method.id)).map((recipe) => recipe.id)),
      ])));
    } catch {
      setError("Рецептите не можаха да се заредят.");
    } finally {
      setLoading(false);
    }
  }

  function toggleRecipe(recipeId: string) {
    setSelectedByMethod((current) => {
      const selected = new Set(current[activeMethodId] ?? []);
      if (selected.has(recipeId)) selected.delete(recipeId); else selected.add(recipeId);
      return { ...current, [activeMethodId]: selected };
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const assignments = Object.fromEntries(
        COOKING_METHODS.map((method) => [method.id, [...(selectedByMethod[method.id] ?? [])]])
      );
      const response = await fetch("/api/recipes/cooking-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments }),
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
    return query ? recipes.filter((recipe) => recipe.title.toLocaleLowerCase("bg").includes(query)) : recipes;
  }, [recipes, search]);

  const activeMethod = COOKING_METHODS.find((method) => method.id === activeMethodId)!;
  const selectedIds = selectedByMethod[activeMethodId] ?? new Set<string>();

  return <>
    <button type="button" onClick={handleOpen} className={prominent
      ? "bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
      : "flex-1 sm:flex-none border border-primary text-primary rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors"}>
      + Управление на методи
    </button>

    {open && <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => !saving && setOpen(false)} role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="method-manager-title" className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div><h2 id="method-manager-title" className="font-semibold text-foreground">Методи на готвене</h2><p className="text-xs text-muted mt-0.5">Избрани: {selectedIds.size}</p></div>
            <button type="button" onClick={() => setOpen(false)} disabled={saving} className="text-muted hover:text-foreground text-lg" aria-label="Затвори">✕</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COOKING_METHODS.map((method) => <button key={method.id} type="button" onClick={() => setActiveMethodId(method.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${activeMethodId === method.id ? cookingMethodBadgeClass(method.color) + " ring-2 ring-current/30" : "bg-secondary text-muted"}`}>{method.icon} {method.name}</button>)}
          </div>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Търси за ${activeMethod.name}…`} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" autoFocus />
        </div>
        <div className="max-h-[50vh] overflow-y-auto divide-y divide-border">
          {loading ? <p className="px-4 py-8 text-center text-sm text-muted">Зареждане...</p> : filteredRecipes.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted">{recipes.length ? "Няма намерени рецепти." : "Все още няма създадени рецепти."}</p> : filteredRecipes.map((recipe) => <label key={recipe.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary transition-colors"><input type="checkbox" checked={selectedIds.has(recipe.id)} onChange={() => toggleRecipe(recipe.id)} className="h-5 w-5 accent-primary shrink-0"/><span className="text-sm text-foreground">{recipe.title}</span></label>)}
        </div>
        {error && <p className="px-4 pt-3 text-sm text-accent">{error}</p>}
        <div className="p-4 border-t border-border flex gap-2"><button type="button" onClick={() => setOpen(false)} disabled={saving} className="flex-1 border border-border rounded-lg py-2.5 text-sm text-muted">Отказ</button><button type="button" onClick={save} disabled={loading || saving || recipes.length === 0} className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50">{saving ? "Запазване..." : "Запази всички"}</button></div>
      </div>
    </div>}
  </>;
}
