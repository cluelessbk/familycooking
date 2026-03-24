"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setError("Could not send sign-in link. Is your email on the allowed list?");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">&#9993;</div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Check your email
          </h1>
          <p className="text-muted text-sm">
            We sent a sign-in link to <strong>{email}</strong>. Click it to log in.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          FamilyCooking
        </h1>
        <p className="text-muted text-sm text-center mb-6">
          Sign in with your email to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            {loading ? "Sending..." : "Send sign-in link"}
          </button>
        </form>
      </div>
    </main>
  );
}
