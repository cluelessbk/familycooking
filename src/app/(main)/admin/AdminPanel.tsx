"use client";

import { useEffect, useState } from "react";

type Member = {
  userId: string;
  role: "OWNER" | "MEMBER";
  user: { email: string; name?: string | null };
};

type Invite = {
  id: string;
  token: string;
  url: string;
  expiresAt: string;
};

export function AdminPanel() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [myUserId, setMyUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/household/settings"),
      fetch("/api/household/invite"),
    ]).then(async ([settingsResponse, invitesResponse]) => {
      if (cancelled) return;
      if (!settingsResponse.ok || !invitesResponse.ok) {
        setError("Административните данни не могат да бъдат заредени.");
        setLoading(false);
        return;
      }
      const settings = await settingsResponse.json();
      const activeInvites = await invitesResponse.json();
      if (cancelled) return;
      setMembers(settings.members);
      setMyUserId(settings.myUserId);
      setInvites(activeInvites);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function changeRole(member: Member) {
    setBusyUserId(member.userId);
    setError("");
    const nextRole = member.role === "OWNER" ? "MEMBER" : "OWNER";
    const response = await fetch(`/api/household/members/${member.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    const body = await response.json();
    if (response.ok) {
      if (member.userId === myUserId && nextRole === "MEMBER") {
        window.location.assign("/settings");
        return;
      }
      setMembers((current) => current.map((item) => item.userId === member.userId ? body : item));
    } else {
      setError(body.error ?? "Ролята не може да бъде променена.");
    }
    setBusyUserId("");
  }

  async function removeMember(member: Member) {
    if (!window.confirm(`Да премахнем ли ${member.user.name ?? member.user.email} от домакинството?`)) return;
    setBusyUserId(member.userId);
    setError("");
    const response = await fetch(`/api/household/members/${member.userId}`, { method: "DELETE" });
    const body = await response.json();
    if (response.ok) {
      setMembers((current) => current.filter((item) => item.userId !== member.userId));
    } else {
      setError(body.error ?? "Членът не може да бъде премахнат.");
    }
    setBusyUserId("");
  }

  async function revokeInvite(token: string) {
    const response = await fetch("/api/household/invite", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (response.ok) setInvites((current) => current.filter((invite) => invite.token !== token));
  }

  if (loading) return <p className="text-sm text-muted">Зареждане…</p>;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Администрация</h1>
        <p className="text-sm text-muted mt-1">Управление на членовете и активните покани.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Членове</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {members.map((member) => {
            const isMe = member.userId === myUserId;
            return (
              <div key={member.userId} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">
                    {member.user.name ?? member.user.email}{isMe ? " (ти)" : ""}
                  </p>
                  {member.user.name && <p className="text-xs text-muted truncate">{member.user.email}</p>}
                  <p className="text-xs text-muted mt-1">{member.role === "OWNER" ? "Собственик" : "Член"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeRole(member)}
                    disabled={busyUserId === member.userId}
                    className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-foreground disabled:opacity-50"
                  >
                    {member.role === "OWNER" ? "Направи член" : "Направи собственик"}
                  </button>
                  {!isMe && (
                    <button
                      onClick={() => removeMember(member)}
                      disabled={busyUserId === member.userId}
                      className="px-3 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 disabled:opacity-50"
                    >
                      Премахни
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Активни покани</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {invites.length === 0 && <p className="px-4 py-3 text-sm text-muted">Няма активни покани.</p>}
          {invites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-mono text-muted truncate">{invite.url}</p>
                <p className="text-xs text-muted mt-1">Валидна до {new Date(invite.expiresAt).toLocaleDateString("bg-BG")}</p>
              </div>
              <button onClick={() => revokeInvite(invite.token)} className="text-xs font-medium text-red-600 shrink-0">Отмени</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
