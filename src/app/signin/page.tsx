"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") ?? undefined;

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        setError("Изчакай малко преди да изпратиш нов код.");
        return;
      }
      if (!res.ok) {
        setError("Нещо се обърка. Опитай отново.");
        return;
      }

      setStep("code");
      setCooldown(60);
    } catch {
      setError("Нещо се обърка. Опитай отново.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        setError("Изчакай малко преди да изпратиш нов код.");
        return;
      }
      if (!res.ok) {
        setError("Нещо се обърка. Опитай отново.");
        return;
      }

      setCooldown(60);
    } catch {
      setError("Нещо се обърка. Опитай отново.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("otp", {
        email,
        code,
        inviteToken: inviteToken ?? "",
        redirect: false,
      });

      if (result?.error) {
        setError("Грешен или изтекъл код. Опитай отново.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Нещо се обърка. Опитай отново.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          FamilyCooking
        </h1>

        {inviteToken && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm text-center">
            Поканен/а си да се присъединиш към домакинство
          </div>
        )}

        {step === "email" ? (
          <>
            <p className="text-muted text-sm text-center mb-6">
              Въведи имейла си, за да получиш код за вход
            </p>
            <form onSubmit={handleSendCode} className="space-y-4">
              <input
                type="email"
                placeholder="твоят@имейл.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />

              {error && (
                <p className="text-accent text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Изпращане..." : "Изпрати код"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-muted text-sm text-center mb-6">
              Изпратихме 6-цифрен код на <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-xl tracking-widest"
              />

              {error && (
                <p className="text-accent text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Проверяване..." : "Вход"}
              </button>
            </form>

            <div className="mt-4 flex justify-between text-sm text-muted">
              <button
                type="button"
                onClick={() => { setStep("email"); setError(""); setCode(""); }}
                className="hover:text-foreground transition-colors"
              >
                Друг имейл
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Изпрати отново (${cooldown}s)` : "Изпрати отново"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
