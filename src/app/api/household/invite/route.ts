import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

// POST — every household member may invite another member.
export async function POST(req: NextRequest) {
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
  if (!member) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.inviteLink.create({
    data: { token, householdId, createdBy: userId, expiresAt },
  });

  const url = `${req.nextUrl.origin}/join/${invite.token}`;

  return Response.json({ url, expiresAt: invite.expiresAt });
}

// GET — list active invite links (owner only)
export async function GET(req: NextRequest) {
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

  const base = req.nextUrl.origin;
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
