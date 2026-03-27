"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type GroceryList = { id: string; mealPlanId: string | null };
type GroceryItem = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  checked: boolean;
  isManual: boolean;
};

// ─── Date helpers (same pattern as planner) ───────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
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

function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", timeZone: "UTC" };
  return `${monday.toLocaleDateString("bg-BG", opts)} – ${sunday.toLocaleDateString("bg-BG", opts)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GroceriesPage() {
  const [weekMonday, setWeekMonday] = useState<Date>(() => getMondayOf(new Date()));
  const [list, setList] = useState<GroceryList | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Manual add form state
  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("");
  const [addUnit, setAddUnit] = useState("");
  const [adding, setAdding] = useState(false);

  const loadList = useCallback(async (monday: Date) => {
    setLoading(true);
    const res = await fetch(`/api/groceries?week=${toISODate(monday)}`);
    const data = await res.json();
    setList(data.list);
    setItems(data.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadList(weekMonday);
  }, [weekMonday, loadList]);

  async function generate() {
    setGenerating(true);
    const res = await fetch("/api/groceries/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week: toISODate(weekMonday) }),
    });
    const data = await res.json();
    setList(data.list);
    setItems(data.items);
    setGenerating(false);
  }

  async function clearList() {
    if (!list) return;
    setClearing(true);
    await fetch(`/api/groceries/${list.id}/items`, { method: "DELETE" });
    setItems([]);
    setClearing(false);
  }

  async function toggleChecked(item: GroceryItem) {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i))
    );
    await fetch(`/api/groceries/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !item.checked }),
    });
  }

  async function deleteItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await fetch(`/api/groceries/items/${itemId}`, { method: "DELETE" });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !list) return;
    setAdding(true);
    const res = await fetch(`/api/groceries/${list.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addName.trim(),
        quantity: addQty ? Number(addQty) : null,
        unit: addUnit.trim() || null,
      }),
    });
    const newItem = await res.json();
    setItems((prev) => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
    setAddName("");
    setAddQty("");
    setAddUnit("");
    setAdding(false);
  }

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setWeekMonday((m) => addDays(m, -7))}
          className="p-2 rounded-lg border border-border hover:border-primary transition-colors text-foreground"
          aria-label="Previous week"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-foreground">{formatWeekRange(weekMonday)}</h1>
          <button
            onClick={() => setWeekMonday(getMondayOf(new Date()))}
            className="text-xs text-primary hover:underline mt-0.5"
          >
            Тази седмица
          </button>
        </div>
        <button
          onClick={() => setWeekMonday((m) => addDays(m, 7))}
          className="p-2 rounded-lg border border-border hover:border-primary transition-colors text-foreground"
          aria-label="Next week"
        >
          →
        </button>
      </div>

      {/* Generate / Clear buttons */}
      <div className="flex gap-2">
        <button
          onClick={generate}
          disabled={generating || clearing}
          className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {generating
            ? "Генериране…"
            : list
            ? "Обнови от плана"
            : "Генерирай от плана"}
        </button>
        {list && items.length > 0 && (
          <button
            onClick={clearList}
            disabled={clearing || generating}
            className="py-2.5 px-4 rounded-lg border border-accent text-accent text-sm font-medium hover:bg-accent/10 transition-colors disabled:opacity-60"
          >
            {clearing ? "…" : "Изчисти"}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-muted py-8">Зареждане…</p>
      ) : !list ? (
        <p className="text-center text-muted text-sm py-8">
          Няма списък за тази седмица. Натисни „Генерирай от плана" за да го създадеш.
        </p>
      ) : items.length === 0 ? (
        <p className="text-center text-muted text-sm py-8">
          Списъкът е празен. Добави продукти ръчно или обнови от плана.
        </p>
      ) : (
        <div className="space-y-1">
          {/* Unchecked items */}
          {unchecked.map((item) => (
            <ItemRow key={item.id} item={item} onToggle={toggleChecked} onDelete={deleteItem} />
          ))}

          {/* Checked items */}
          {checked.length > 0 && (
            <>
              {unchecked.length > 0 && <div className="border-t border-border my-3" />}
              {checked.map((item) => (
                <ItemRow key={item.id} item={item} onToggle={toggleChecked} onDelete={deleteItem} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Manual add form — only show when a list exists */}
      {list && (
        <form onSubmit={addItem} className="pt-4 border-t border-border space-y-2">
          <p className="text-sm font-medium text-foreground">Добави ръчно</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Продукт"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="flex-1 min-w-0 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
              required
            />
            <input
              type="number"
              placeholder="Кол."
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              className="w-16 border border-border rounded-lg px-2 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
              min="0"
              step="any"
            />
            <input
              type="text"
              placeholder="Мярка"
              value={addUnit}
              onChange={(e) => setAddUnit(e.target.value)}
              className="w-20 border border-border rounded-lg px-2 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !addName.trim()}
            className="w-full py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            {adding ? "Добавяне…" : "+ Добави"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: GroceryItem;
  onToggle: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
}) {
  const qtyLabel =
    item.quantity !== null
      ? `${Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)}${item.unit ? " " + item.unit : ""}`
      : item.unit || "";

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${item.checked ? "opacity-50" : ""}`}>
      <button
        onClick={() => onToggle(item)}
        className={`w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
          item.checked ? "bg-primary border-primary" : "border-border hover:border-primary"
        }`}
        aria-label={item.checked ? "Uncheck" : "Check"}
      >
        {item.checked && <span className="text-white text-xs leading-none">✓</span>}
      </button>
      <span className={`flex-1 text-sm text-foreground ${item.checked ? "line-through" : ""}`}>
        {item.name}
      </span>
      {qtyLabel && (
        <span className="text-xs text-muted shrink-0">{qtyLabel}</span>
      )}
      <button
        onClick={() => onDelete(item.id)}
        className="shrink-0 text-muted hover:text-red-500 transition-colors text-sm leading-none ml-1"
        aria-label="Remove"
      >
        ×
      </button>
    </div>
  );
}
