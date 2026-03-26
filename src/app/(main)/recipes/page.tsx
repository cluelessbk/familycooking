"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = activeCategoryId
      ? `/api/recipes?categoryId=${activeCategoryId}`
      : "/api/recipes";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      });
  }, [activeCategoryId]);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Рецепти</h1>
        <Link
          href="/recipes/new"
          className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          + Добави рецепта
        </Link>
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
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategoryId(null)}
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
            onClick={() =>
              setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategoryId === cat.id
                ? "bg-primary text-white"
                : "bg-secondary text-muted hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Recipes grid */}
      {loading ? (
        <p className="text-muted text-sm">Зареждане...</p>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted mb-4">Няма рецепти.</p>
          <Link
            href="/recipes/new"
            className="bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Добави първата рецепта
          </Link>
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
      href={`/recipes/${recipe.id}`}
      className="block p-5 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all"
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
        <h2 className="font-semibold text-foreground">{recipe.title}</h2>
        {recipe.description && (
          <p className="text-sm text-muted line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted pt-1">
          {totalTime > 0 && <span>⏱ {totalTime} мин</span>}
          {recipe.servings && <span>👥 {recipe.servings} порции</span>}
        </div>
      </div>
    </Link>
  );
}
