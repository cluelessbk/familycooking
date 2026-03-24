"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteRecipeButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    router.push("/recipes");
  }

  if (confirming) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-accent text-white rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-muted hover:text-foreground transition-colors px-2 py-2"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
    >
      Delete
    </button>
  );
}
