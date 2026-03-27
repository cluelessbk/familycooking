"use client";

import { useEffect, useState } from "react";
import { useFitText } from "@/hooks/useFitText";
import { useRouter, useParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface IngredientRow {
  name: string;
  quantity: string;
  unit: string;
}

interface StepRow {
  instruction: string;
}

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const titleRef = useFitText(title);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/recipes/${id}`).then((r) => r.json()),
    ]).then(([cats, recipe]) => {
      setCategories(cats);
      setTitle(recipe.title ?? "");
      setDescription(recipe.description ?? "");
      setCategoryId(recipe.categoryId ?? "");
      setServings(recipe.servings != null ? String(recipe.servings) : "");
      setPrepTime(recipe.prepTime != null ? String(recipe.prepTime) : "");
      setCookTime(recipe.cookTime != null ? String(recipe.cookTime) : "");
      setExistingPhotoUrl(recipe.photoUrl ?? null);
      setIngredients(
        recipe.ingredients?.length
          ? recipe.ingredients.map((ing: { name: string; quantity: number | null; unit: string | null }) => ({
              name: ing.name,
              quantity: ing.quantity != null ? String(ing.quantity) : "",
              unit: ing.unit ?? "",
            }))
          : [{ name: "", quantity: "", unit: "" }]
      );
      setSteps(
        recipe.steps?.length
          ? recipe.steps.map((s: { instruction: string }) => ({ instruction: s.instruction }))
          : [{ instruction: "" }]
      );
      setLoading(false);
    });
  }, [id]);

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: "", quantity: "", unit: "" }]);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, field: keyof IngredientRow, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  }

  function addStep() {
    setSteps((prev) => [...prev, { instruction: "" }]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStep(index: number, value: string) {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { instruction: value } : step))
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Заглавието е задължително.");
      return;
    }

    setSubmitting(true);
    setError(null);

    let photoUrl: string | undefined = existingPhotoUrl ?? undefined;
    if (photoFile) {
      const fd = new FormData();
      fd.append("file", photoFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(`Грешка при качване на снимка: ${uploadData.error ?? "неизвестна грешка"}`);
        setSubmitting(false);
        return;
      }
      const { url } = uploadData;
      photoUrl = url;
    }

    const body = {
      title: title.trim(),
      photoUrl,
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      servings: servings ? Number(servings) : undefined,
      prepTime: prepTime ? Number(prepTime) : undefined,
      cookTime: cookTime ? Number(cookTime) : undefined,
      ingredients: ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({
          name: ing.name.trim(),
          quantity: ing.quantity ? Number(ing.quantity) : undefined,
          unit: ing.unit.trim() || undefined,
        })),
      steps: steps
        .filter((s) => s.instruction.trim())
        .map((s, i) => ({ stepNumber: i + 1, instruction: s.instruction.trim() })),
    };

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Нещо се обърка.");
        setSubmitting(false);
        return;
      }

      router.push(`/recipes/${id}`);
    } catch {
      setError("Грешка при запазване.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-muted text-sm">Зареждане...</p>;
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground">Редактирай рецепта</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Детайли</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="title">
              Заглавие <span className="text-accent">*</span>
            </label>
            <input
              ref={titleRef}
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. Баница на баба"
              className="w-full border border-border rounded-lg px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="description">
              Описание
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Кратко описание на рецептата..."
              className="w-full border border-border rounded-lg px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="category">
              Категория
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="">— Избери категория —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="servings">
                Порции
              </label>
              <input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
                className="w-full border border-border rounded-lg px-3 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="prepTime">
                Подготовка
              </label>
              <input
                id="prepTime"
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="мин"
                className="w-full border border-border rounded-lg px-3 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="cookTime">
                Готвене
              </label>
              <input
                id="cookTime"
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="мин"
                className="w-full border border-border rounded-lg px-3 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted"
              />
            </div>
          </div>
        </section>

        {/* Photo */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Снимка</h2>
          {(photoPreview || existingPhotoUrl) && (
            <img
              src={photoPreview ?? existingPhotoUrl!}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="shrink-0 px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-medium text-foreground hover:bg-border transition-colors">
              Избери снимка
            </span>
            <span className="text-sm text-muted truncate">
              {photoFile ? photoFile.name : "Няма избран файл"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
          </label>
          {existingPhotoUrl && !photoPreview && (
            <button
              type="button"
              onClick={() => setExistingPhotoUrl(null)}
              className="text-sm text-accent hover:underline"
            >
              Премахни снимката
            </button>
          )}
        </section>

        {/* Ingredients */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Съставки</h2>

          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  placeholder="Съставка"
                  className="flex-1 min-w-0 border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted text-sm"
                />
                <input
                  type="number"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                  placeholder="Кол."
                  className="w-14 border border-border rounded-lg px-2 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted text-sm"
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                  placeholder="Мярка"
                  className="w-16 border border-border rounded-lg px-2 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted text-sm"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="text-muted hover:text-accent transition-colors p-1"
                    aria-label="Remove ingredient"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            + Добави съставка
          </button>
        </section>

        {/* Steps */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Стъпки</h2>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center mt-2">
                  {i + 1}
                </span>
                <textarea
                  value={step.instruction}
                  onChange={(e) => updateStep(i, e.target.value)}
                  rows={2}
                  placeholder={`Стъпка ${i + 1}...`}
                  className="flex-1 border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted text-sm resize-none"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="text-muted hover:text-accent transition-colors p-1 mt-2"
                    aria-label="Remove step"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStep}
            className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            + Добави стъпка
          </button>
        </section>

        {error && (
          <p className="text-accent text-sm font-medium">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary text-white rounded-lg py-3 font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Запазване..." : "Запази промените"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/recipes/${id}`)}
            className="flex-1 border border-border text-foreground rounded-lg py-3 font-semibold hover:bg-secondary transition-colors"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
