"use client";

import { useState } from "react";

interface ShareButtonProps {
  recipeId: string;
  variant: "card" | "detail";
}

export function ShareButton({ recipeId, variant }: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle");

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (state !== "idle") return;
    setState("loading");

    try {
      const res = await fetch(`/api/recipes/${recipeId}/share`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const { shareUrl } = await res.json();
      await navigator.clipboard.writeText(shareUrl);
      setState("copied");
      setTimeout(() => setState("idle"), 3500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  const toast = state === "copied" && (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-card px-5 py-3 rounded-xl shadow-lg text-sm text-center animate-fade-in max-w-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="font-semibold">Линкът е копиран!</p>
      <p className="text-card/70 text-xs mt-0.5">Постави го в чат или съобщение, за да споделиш рецептата.</p>
    </div>
  );

  if (variant === "card") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title="Сподели рецепта"
          className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-card/80 backdrop-blur border border-border hover:border-primary hover:bg-card transition-all"
        >
          {state === "loading" ? (
            <span className="text-xs text-muted">...</span>
          ) : state === "copied" ? (
            <span className="text-xs text-primary">&#10003;</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
        </button>
        {toast}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-border transition-colors"
      >
        {state === "loading" ? "..." : state === "copied" ? "Копирано!" : state === "error" ? "Грешка" : "Сподели"}
      </button>
      {toast}
    </>
  );
}
