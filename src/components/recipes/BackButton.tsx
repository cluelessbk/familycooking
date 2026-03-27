"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function BackButton({ label, href }: { label: string; href?: string }) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} className="text-sm text-muted hover:text-foreground transition-colors">
        ← {label}
      </Link>
    );
  }

  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-muted hover:text-foreground transition-colors"
    >
      ← {label}
    </button>
  );
}
