"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function NewRecipePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { name: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<StepRow[]>([{ instruction: "" }]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

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

    let photoUrl: string | undefined;
    if (photoFile) {
      const fd = new FormData();
      fd.append("file", photoFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(`Photo upload failed: ${uploadData.error ?? "unknown error"}`);
        setSubmitting(false);
        return;
      }
      const { url } = uploadData;
      photoUrl = url;
    }

    const body = {
      photoUrl,
      title: title.trim(),
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
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Нещо се обърка.");
        setSubmitting(false);
        return;
      }

      const recipe = await res.json();
      router.push(`/recipes/${recipe.id}`);
    } catch {
      setError("Грешка при запазване.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground">Нова рецепта</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Детайли</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="title">
              Заглавие <span className="text-accent">*</span>
            </label>
            <input
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
                className="w-full border border-border rounded-lg px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="prepTime">
                Подготовка (мин)
              </label>
              <input
                id="prepTime"
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15"
                className="w-full border border-border rounded-lg px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="cookTime">
                Готвене (мин)
              </label>
              <input
                id="cookTime"
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="30"
                className="w-full border border-border rounded-lg px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted"
              />
            </div>
          </div>
        </section>

        {/* Photo */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Снимка</h2>
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          <label className="block">
            <span className="sr-only">Choose photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-foreground hover:file:bg-border transition-colors cursor-pointer"
            />
          </label>
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
                  className="flex-1 border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted text-sm"
                />
                <input
                  type="number"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                  placeholder="Кол."
                  className="w-20 border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted text-sm"
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                  placeholder="Мярка"
                  className="w-20 border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted text-sm"
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
            {submitting ? "Запазване..." : "Запази рецептата"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/recipes")}
            className="flex-1 border border-border text-foreground rounded-lg py-3 font-semibold hover:bg-secondary transition-colors"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
