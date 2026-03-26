"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-muted hover:text-foreground transition-colors"
    >
      ← Back to Recipes
    </button>
  );
}
