"use client";

import { useEffect, useState } from "react";

type Slot = { id: string; name: string; sortOrder: number };
type Recipe = { id: string; title: string };
type Meal = { id: string; date: string; mealSlotId: string; recipe: Recipe };

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function TodayPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const monday = getMondayOf(new Date());
    fetch(`/api/planner?week=${toISODate(monday)}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setMeals(data.meals ?? []);
        setLoading(false);
      });
  }, []);

  const todayStr = toISODate(new Date());

  const todayLabel = new Date().toLocaleDateString("bg-BG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const todayMeals = meals.filter((m) => m.date.slice(0, 10) === todayStr);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground capitalize">{todayLabel}</h1>

      {loading ? (
        <p className="text-muted">Зареждане…</p>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => {
            const slotMeals = todayMeals.filter((m) => m.mealSlotId === slot.id);
            return (
              <div
                key={slot.id}
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl"
              >
                <div className="w-24 shrink-0 pt-0.5">
                  <span className="text-sm font-medium text-muted">{slot.name}</span>
                </div>
                {slotMeals.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {slotMeals.map((meal) => (
                      <a
                        key={meal.id}
                        href={`/recipes/${meal.recipe.id}`}
                        className="text-foreground font-medium hover:text-primary transition-colors"
                      >
                        {meal.recipe.title}
                      </a>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted text-sm italic">Нищо планирано</span>
                )}
              </div>
            );
          })}

          {slots.length === 0 && (
            <p className="text-muted text-sm">
              Все още няма добавени хранения.{" "}
              <a href="/planner" className="text-primary hover:underline">
                Отиди в плановика
              </a>{" "}
              за да планираш седмицата.
            </p>
          )}
        </div>
      )}

      <a
        href="/planner"
        className="inline-block text-sm text-primary hover:underline"
      >
        → Към седмичния план
      </a>
    </div>
  );
}
