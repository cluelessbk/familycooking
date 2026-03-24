"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-primary">
          FamilyCooking
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/recipes"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Recipes
          </Link>
          <Link
            href="/planner"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Planner
          </Link>
          <Link
            href="/groceries"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Groceries
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
