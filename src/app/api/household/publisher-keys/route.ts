import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createPublisherKey } from "@/lib/publisher-api";

async function ownerSession() {
  const session = await auth();
  if (!session?.user?.householdId) return null;
  const membership = await prisma.householdMember.findUnique({ where: { userId: session.user.id } });
  return membership?.role === "OWNER" ? session : null;
}

export async function GET() {
  const session = await ownerSession();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });
  const keys = await prisma.publisherApiKey.findMany({
    where: { householdId: session.user.householdId },
    select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true, revokedAt: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(keys);
}

export async function POST(request: Request) {
  const session = await ownerSession();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) return Response.json({ error: "Name must be between 1 and 80 characters" }, { status: 400 });
  const generated = createPublisherKey();
  const key = await prisma.publisherApiKey.create({
    data: {
      householdId: session.user.householdId,
      name,
      keyPrefix: generated.keyPrefix,
      keyHash: generated.keyHash,
      createdBy: session.user.id,
    },
    select: { id: true, name: true, keyPrefix: true, createdAt: true },
  });
  return Response.json({ ...key, key: generated.key }, { status: 201 });
}
