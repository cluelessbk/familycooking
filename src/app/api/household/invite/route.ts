import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

// POST — generate a new invite link (owner only)
export async function POST() {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;
  const userId = session.user.id;

  // Verify OWNER role
  const member = await prisma.householdMember.findUnique({
    where: { userId },
    select: { role: true },
  });
  if (member?.role !== "OWNER") {
    return Response.json({ error: "Only owners can create invite links" }, { status: 403 });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.inviteLink.create({
    data: { token, householdId, createdBy: userId, expiresAt },
  });

  const url = `${process.env.NEXTAUTH_URL ?? ""}/join/${invite.token}`;

  return Response.json({ url, expiresAt: invite.expiresAt });
}

// GET — list active invite links (owner only)
export async function GET() {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;
  const userId = session.user.id;

  const member = await prisma.householdMember.findUnique({
    where: { userId },
    select: { role: true },
  });
  if (member?.role !== "OWNER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const links = await prisma.inviteLink.findMany({
    where: { householdId, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "desc" },
  });

  const base = process.env.NEXTAUTH_URL ?? "";
  return Response.json(links.map((l) => ({ ...l, url: `${base}/join/${l.token}` })));
}

// DELETE — revoke an invite link (owner only)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;
  const userId = session.user.id;

  const member = await prisma.householdMember.findUnique({
    where: { userId },
    select: { role: true },
  });
  if (member?.role !== "OWNER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { token } = await req.json();
  if (!token) return Response.json({ error: "token required" }, { status: 400 });

  await prisma.inviteLink.deleteMany({
    where: { token, householdId },
  });

  return Response.json({ ok: true });
}
