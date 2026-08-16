"use client";

import { useEffect, useRef, useState } from "react";
import { COOKING_METHODS } from "@/lib/cooking-methods";

interface CookingMethodSelectProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CookingMethodSelect({ selected, onChange }: CookingMethodSelectProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

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
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between gap-3 text-left"
        >
          <span className="truncate">{summary}</span>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
            <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && <div role="listbox" aria-multiselectable="true" className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-2 space-y-1">
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
        </div>}
      </div>
    </div>
  );
}
