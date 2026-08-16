"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShareButton } from "@/components/recipes/ShareButton";
import { CookingMethodManager } from "@/components/recipes/CookingMethodManager";
import { COOKING_METHODS, cookingMethodBadgeClass } from "@/lib/cooking-methods";

interface Category {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  category: Category | null;
  cookingMethods: { cookingMethod: { id: string; name: string; icon: string; color: string } }[];
}

function RecipesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category");
  const selectedMethods = searchParams.get("methods")?.split(",").filter(Boolean) ?? [];
  const selectedMethodsKey = selectedMethods.join(",");

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategoryId) params.set("categoryId", activeCategoryId);
    if (selectedMethodsKey) params.set("methods", selectedMethodsKey);
    const url = `/api/recipes${params.size ? `?${params}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      });
  }, [activeCategoryId, selectedMethodsKey, refreshKey]);

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
      setNewCategoryName("");
      setAddingCategory(false);
    }
    setSavingCategory(false);
  }

  function selectCategory(id: string | null) {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("category", id); else params.delete("category");
    router.replace(`/recipes${params.size ? `?${params}` : ""}`);
  }

  function toggleMethod(methodId: string) {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    const next = selectedMethods.includes(methodId)
      ? selectedMethods.filter((id) => id !== methodId)
      : [...selectedMethods, methodId];
    if (next.length) params.set("methods", next.join(",")); else params.delete("methods");
    router.replace(`/recipes${params.size ? `?${params}` : ""}`);
  }

  const filteredRecipes = recipes.filter((r) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Рецепти</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CookingMethodManager onSaved={() => { setLoading(true); setRefreshKey((key) => key + 1); }} />
          <Link
            href="/recipes/new"
            className="flex-1 sm:flex-none text-center bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            + Добави рецепта
          </Link>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Търси рецепта..."
        className="w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => selectCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategoryId === null
              ? "bg-primary text-white"
              : "bg-secondary text-muted hover:text-foreground"
          }`}
        >
          Всички
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategory(activeCategoryId === cat.id ? null : cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategoryId === cat.id
                ? "bg-primary text-white"
                : "bg-secondary text-muted hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}

        {addingCategory ? (
          <form onSubmit={saveCategory} className="flex items-center gap-1">
            <input
              autoFocus
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Нова категория"
              className="border border-primary rounded-full px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none w-36"
            />
            <button
              type="submit"
              disabled={savingCategory || !newCategoryName.trim()}
              className="px-3 py-1.5 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {savingCategory ? "…" : "Запази"}
            </button>
            <button
              type="button"
              onClick={() => { setAddingCategory(false); setNewCategoryName(""); }}
              className="px-2 py-1.5 rounded-full text-muted hover:text-foreground text-sm transition-colors"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAddingCategory(true)}
            className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors"
          >
            + Категория
          </button>
        )}
        <span className="text-border text-xl px-1" aria-hidden="true">|</span>
        <details className="relative group">
          <summary className="list-none cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-muted hover:text-foreground flex items-center gap-1.5">
            Методи{selectedMethods.length ? ` (${selectedMethods.length})` : ""} <span className="group-open:rotate-180 transition-transform">⌄</span>
          </summary>
          <div className="absolute z-30 mt-2 right-0 sm:left-0 sm:right-auto min-w-64 rounded-xl border border-border bg-card shadow-lg p-2">
            {COOKING_METHODS.map((method) => (
              <label key={method.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary cursor-pointer">
                <input type="checkbox" checked={selectedMethods.includes(method.id)} onChange={() => toggleMethod(method.id)} className="h-5 w-5 accent-primary" />
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cookingMethodBadgeClass(method.color)}`}>{method.icon} {method.name}</span>
              </label>
            ))}
            <p className="px-3 pt-2 pb-1 text-xs text-muted">Избраните методи се комбинират с „или“.</p>
          </div>
        </details>
      </div>

      {/* Recipes grid */}
      {loading ? (
        <p className="text-muted text-sm">Зареждане...</p>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted mb-4">Няма рецепти.</p>
          {selectedMethods.length ? (
            <CookingMethodManager
              prominent
              onSaved={() => { setLoading(true); setRefreshKey((key) => key + 1); }}
            />
          ) : (
            <Link
              href="/recipes/new"
              className="bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Добави първата рецепта
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime =
    (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <Link
      href={`/recipes/${recipe.id}?from=recipes`}
      className="relative block p-5 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all"
    >
      {/* Photo */}
      {recipe.photoUrl ? (
        <img
          src={recipe.photoUrl}
          alt={recipe.title}
          className="w-full h-32 object-cover rounded-lg mb-4"
        />
      ) : (
        <div className="w-full h-32 bg-secondary rounded-lg mb-4 flex items-center justify-center">
          <span className="text-3xl">🍽️</span>
        </div>
      )}

      <div className="space-y-2">
        {recipe.category && (
          <span className="inline-block bg-secondary text-muted text-xs font-medium px-2 py-0.5 rounded-full">
            {recipe.category.name}
          </span>
        )}
        {recipe.cookingMethods.map(({ cookingMethod }) => (
          <span key={cookingMethod.id} className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ml-1 ${cookingMethodBadgeClass(cookingMethod.color)}`}>
            {cookingMethod.icon} {cookingMethod.name}
          </span>
        ))}
        <h2 className="font-semibold text-foreground">{recipe.title}</h2>
        {recipe.description && (
          <p className="text-sm text-muted line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted pt-1">
          {totalTime > 0 && <span>⏱ {totalTime} мин</span>}
          {recipe.servings && <span>👥 {recipe.servings} порции</span>}
        </div>
      </div>
      <ShareButton recipeId={recipe.id} variant="card" />
    </Link>
  );
}

export default function RecipesPage() {
  return (
    <Suspense>
      <RecipesPageContent />
    </Suspense>
  );
}
