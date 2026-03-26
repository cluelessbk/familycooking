"use client";

import { useState } from "react";

interface MealSlot {
  id: string;
  name: string;
}

function getMondayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddToMealPlanButton({ recipeId }: { recipeId: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO);
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    setSuccess(false);
    setError(null);
    if (slots.length === 0) {
      const week = getMondayOf(new Date());
      const res = await fetch(`/api/planner?week=${week}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
      if (data.slots?.length > 0) setSlotId(data.slots[0].id);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slotId) return;
    setLoading(true);
    setError(null);

    const week = getMondayOf(new Date(date));
    const planRes = await fetch(`/api/planner?week=${week}`);
    const planData = await planRes.json();
    const mealPlanId = planData.plan?.id;

    if (!mealPlanId) {
      setError("Could not find or create meal plan.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/planner/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealPlanId, date, mealSlotId: slotId, recipeId }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        + Meal Plan
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-10 w-64 bg-card border border-border rounded-xl shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Add to meal plan</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-foreground transition-colors text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {success ? (
            <p className="text-sm text-green-600 font-medium text-center py-2">Added!</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted">Meal</label>
                <select
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-accent">{error}</p>}

              <button
                type="submit"
                disabled={loading || !slotId}
                className="w-full bg-primary text-white rounded-lg py-2 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
