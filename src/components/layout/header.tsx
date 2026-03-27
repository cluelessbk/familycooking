"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Top header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            FamilyCooking
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-4">
            <Link href="/recipes" className="text-sm text-muted hover:text-foreground transition-colors">
              Рецепти
            </Link>
            <Link href="/planner" className="text-sm text-muted hover:text-foreground transition-colors">
              Планер
            </Link>
            <Link href="/groceries" className="text-sm text-muted hover:text-foreground transition-colors">
              Пазаруване
            </Link>
            <Link href="/settings" className="text-sm text-muted hover:text-foreground transition-colors">
              Настройки
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              Изход
            </button>
          </nav>

          {/* Mobile — sign out only */}
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="sm:hidden text-sm text-muted hover:text-accent transition-colors"
          >
            Изход
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/recipes"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              pathname.startsWith("/recipes") ? "text-primary" : "text-muted"
            }`}
          >
            <span className="text-xl">🍽️</span>
            Рецепти
          </Link>
          <Link
            href="/planner"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              pathname.startsWith("/planner") ? "text-primary" : "text-muted"
            }`}
          >
            <span className="text-xl">📅</span>
            Планер
          </Link>
          <Link
            href="/groceries"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              pathname.startsWith("/groceries") ? "text-primary" : "text-muted"
            }`}
          >
            <span className="text-xl">🛒</span>
            Пазаруване
          </Link>
        </div>
      </nav>
    </>
  );
}
