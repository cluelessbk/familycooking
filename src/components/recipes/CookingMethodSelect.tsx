"use client";

import { COOKING_METHODS } from "@/lib/cooking-methods";

interface CookingMethodSelectProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CookingMethodSelect({ selected, onChange }: CookingMethodSelectProps) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  }

  const summary = selected.length === 0
    ? "— Не е избран метод —"
    : COOKING_METHODS.filter((method) => selected.includes(method.id))
        .map((method) => `${method.icon} ${method.name}`)
        .join(", ");

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium text-foreground">Подходяща за</span>
      <details className="group relative">
        <summary className="list-none cursor-pointer w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between gap-3">
          <span className="truncate">{summary}</span>
          <span className="text-muted group-open:rotate-180 transition-transform">⌄</span>
        </summary>
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-2 space-y-1">
          {COOKING_METHODS.map((method) => (
            <label key={method.id} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(method.id)}
                onChange={() => toggle(method.id)}
                className="h-5 w-5 accent-primary"
              />
              <span className="text-foreground">{method.icon} {method.name}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
