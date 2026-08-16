import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getOwner() {
  const session = await auth();
  if (!session?.user?.householdId) return null;

  const membership = await prisma.householdMember.findUnique({
    where: { userId: session.user.id },
    select: { householdId: true, role: true },
  });

  if (membership?.householdId !== session.user.householdId || membership.role !== "OWNER") {
    return null;
  }
  return session;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getOwner();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const body = await request.json();
  const role = body?.role;
  if (role !== "OWNER" && role !== "MEMBER") {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const target = await tx.householdMember.findFirst({
        where: { userId, householdId: session.user.householdId },
      });
      if (!target) throw new Error("NOT_FOUND");

      if (target.role === "OWNER" && role === "MEMBER") {
        const ownerCount = await tx.householdMember.count({
          where: { householdId: session.user.householdId, role: "OWNER" },
        });
        if (ownerCount <= 1) throw new Error("LAST_OWNER");
      }

      return tx.householdMember.update({
        where: { userId },
        data: { role },
        include: { user: { select: { email: true, name: true } } },
      });
    });
    return Response.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "LAST_OWNER") {
      return Response.json({ error: "A household must have at least one owner" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getOwner();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  if (userId === session.user.id) {
    return Response.json({ error: "Owners cannot remove themselves" }, { status: 409 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.householdMember.findFirst({
        where: { userId, householdId: session.user.householdId },
      });
      if (!target) throw new Error("NOT_FOUND");

      if (target.role === "OWNER") {
        const ownerCount = await tx.householdMember.count({
          where: { householdId: session.user.householdId, role: "OWNER" },
        });
        if (ownerCount <= 1) throw new Error("LAST_OWNER");
      }

      await tx.householdMember.delete({ where: { userId } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "LAST_OWNER") {
      return Response.json({ error: "A household must have at least one owner" }, { status: 409 });
    }
    throw error;
  }
}
