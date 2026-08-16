"use client";

import { useEffect, useState } from "react";

type Member = { userId: string; role: string; user?: { email: string; name?: string | null } };
type PublisherKey = { id: string; name: string; keyPrefix: string; createdAt: string; lastUsedAt?: string | null; revokedAt?: string | null };

export default function SettingsPage() {
  const [householdName, setHouseholdName] = useState<string>("");
  const [savedHouseholdName, setSavedHouseholdName] = useState<string>("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [publisherKeys, setPublisherKeys] = useState<PublisherKey[]>([]);
  const [keyName, setKeyName] = useState("Jarvis recipe publisher");
  const [newKey, setNewKey] = useState("");
  const [keyLoading, setKeyLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/household/settings");
        if (res.ok) {
          const data = await res.json();
          setHouseholdName(data.household.name);
          setSavedHouseholdName(data.household.name);
          setMembers(data.members);
          setUserRole(data.myRole);
          if (data.myRole === "OWNER") {
            const keysRes = await fetch("/api/household/publisher-keys");
            if (keysRes.ok) setPublisherKeys(await keysRes.json());
          }
        }
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, []);

  async function handleGenerateInvite() {
    setLoading(true);
    setInviteMessage("");
    try {
      const res = await fetch("/api/household/invite", { method: "POST" });
      const data = await res.json();
      if (!res.ok || typeof data.url !== "string") {
        setInviteMessage("Линкът не можа да бъде генериран. Опитай отново.");
        return;
      }
      setInviteUrl(data.url);
      try {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setInviteMessage("Линкът е генериран и копиран.");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setInviteMessage("Линкът е генериран. Натисни „Копирай“.");
      }
    } catch {
      setInviteMessage("Линкът не можа да бъде генериран. Провери връзката и опитай отново.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveHouseholdName() {
    const name = householdName.trim();
    if (!name || name === savedHouseholdName) return;
    setNameSaving(true);
    setNameMessage("");
    try {
      const res = await fetch("/api/household/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        setNameMessage("Името не можа да бъде запазено.");
        return;
      }
      const data = await res.json();
      setHouseholdName(data.household.name);
      setSavedHouseholdName(data.household.name);
      setNameMessage("Името е запазено.");
    } catch {
      setNameMessage("Името не можа да бъде запазено.");
    } finally {
      setNameSaving(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCreatePublisherKey() {
    setKeyLoading(true);
    try {
      const res = await fetch("/api/household/publisher-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setNewKey(data.key);
      setPublisherKeys((keys) => [data, ...keys]);
    } finally {
      setKeyLoading(false);
    }
  }

  async function handleRevokePublisherKey(id: string) {
    const res = await fetch(`/api/household/publisher-keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPublisherKeys((keys) => keys.map((key) => key.id === id ? { ...key, revokedAt: new Date().toISOString() } : key));
    }
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
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <label htmlFor="household-name" className="block text-sm text-muted">Име</label>
          <div className="flex gap-2">
            <input
              id="household-name"
              value={householdName}
              onChange={(event) => { setHouseholdName(event.target.value); setNameMessage(""); }}
              maxLength={80}
              className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
            />
            <button
              onClick={handleSaveHouseholdName}
              disabled={nameSaving || !householdName.trim() || householdName.trim() === savedHouseholdName}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {nameSaving ? "Запазване…" : "Запази"}
            </button>
          </div>
          {nameMessage && <p className="text-sm text-muted">{nameMessage}</p>}
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

      {/* Every member can invite another person to the household. */}
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

            {inviteMessage && (
              <p className={`text-sm ${inviteUrl ? "text-foreground" : "text-red-600"}`} role="status">
                {inviteMessage}
              </p>
            )}

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

      {userRole === "OWNER" && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">API за публикуване на рецепти</h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <p className="text-sm text-muted">
              Създай отделен ключ за доверен помощник. Ключът има достъп само до рецептите в това домакинство.
            </p>
            <div className="flex gap-2">
              <input
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
                maxLength={80}
                className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                placeholder="Име на ключа"
              />
              <button
                onClick={handleCreatePublisherKey}
                disabled={keyLoading || !keyName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                {keyLoading ? "Създаване…" : "Създай ключ"}
              </button>
            </div>

            {newKey && (
              <div className="p-3 rounded-lg border border-primary bg-background space-y-2">
                <p className="text-sm font-medium text-foreground">Копирай ключа сега — няма да бъде показан отново.</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-muted break-all flex-1">{newKey}</code>
                  <button onClick={() => navigator.clipboard.writeText(newKey)} className="text-xs text-primary font-medium">Копирай</button>
                </div>
              </div>
            )}

            {publisherKeys.length > 0 && (
              <div className="divide-y divide-border border-t border-border">
                {publisherKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{key.name}</p>
                      <p className="text-xs text-muted font-mono">{key.keyPrefix}… · {key.revokedAt ? "Отменен" : "Активен"}</p>
                    </div>
                    {!key.revokedAt && (
                      <button onClick={() => handleRevokePublisherKey(key.id)} className="text-xs text-red-600 font-medium shrink-0">Отмени</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
