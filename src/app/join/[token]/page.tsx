import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.inviteLink.findUnique({
    where: { token },
    include: { household: { select: { name: true } } },
  });

  if (!invite || invite.expiresAt < new Date()) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Невалидна покана
          </h1>
          <p className="text-muted text-sm">
            Тази покана е невалидна или изтекла.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">🏠</div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Поканен/а си!
        </h1>
        <p className="text-muted text-sm mb-6">
          Присъедини се към домакинство{" "}
          <strong className="text-foreground">{invite.household.name}</strong> в FamilyCooking.
        </p>
        <Link
          href={`/signin?invite=${token}`}
          className="block w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors text-center"
        >
          Влез, за да се присъединиш
        </Link>
      </div>
    </main>
  );
}
