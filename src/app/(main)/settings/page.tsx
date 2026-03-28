"use client";

import { useEffect, useState } from "react";

type Member = { userId: string; role: string; user?: { email: string; name?: string | null } };

export default function SettingsPage() {
  const [householdName, setHouseholdName] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/household/settings");
        if (res.ok) {
          const data = await res.json();
          setHouseholdName(data.household.name);
          setMembers(data.members);
          setUserRole(data.myRole);
        }
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, []);

  async function handleGenerateInvite() {
    setLoading(true);
    try {
      const res = await fetch("/api/household/invite", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setInviteUrl(data.url);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (pageLoading) {
    return <p className="text-muted text-sm">Зареждане…</p>;
  }

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-foreground">Настройки</h1>

      {/* Household name */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Домакинство</h2>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted">Название</p>
          <p className="text-foreground font-medium mt-1">{householdName}</p>
        </div>
      </section>

      {/* Members */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Членове</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-foreground font-medium">
                  {m.user?.name ?? m.user?.email ?? m.userId}
                </p>
                {m.user?.name && (
                  <p className="text-xs text-muted">{m.user.email}</p>
                )}
              </div>
              <span className="text-xs text-muted bg-muted/10 px-2 py-0.5 rounded-full">
                {m.role === "OWNER" ? "Собственик" : "Член"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Invite link (owner only) */}
      {userRole === "OWNER" && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Покани</h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-sm text-muted">
              Генерирай линк за покана и го сподели — например по WhatsApp, Viber или друг начин.
              Линкът е валиден 7 дни.
            </p>
            <button
              onClick={handleGenerateInvite}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Генериране…" : "Генерирай линк за покана"}
            </button>

            {inviteUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg">
                  <p className="text-xs text-muted truncate flex-1 font-mono">{inviteUrl}</p>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-primary font-medium shrink-0 hover:underline"
                  >
                    {copied ? "Копирано!" : "Копирай"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
