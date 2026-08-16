import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;
  const userId = session.user.id;

  const household = await prisma.household.findUnique({
    where: { id: householdId },
    include: {
      members: {
        include: { user: { select: { email: true, name: true } } },
      },
    },
  });

  if (!household) {
    return Response.json({ error: "Household not found" }, { status: 404 });
  }

  const myMember = household.members.find((m) => m.userId === userId);

  return Response.json({
    household: { id: household.id, name: household.name },
    members: household.members,
    myUserId: userId,
    myRole: myMember?.role ?? "MEMBER",
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.householdMember.findUnique({
    where: { userId: session.user.id },
    select: { householdId: true },
  });
  if (membership?.householdId !== session.user.householdId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) {
    return Response.json({ error: "Household name must be between 1 and 80 characters" }, { status: 400 });
  }

  const household = await prisma.household.update({
    where: { id: membership.householdId },
    data: { name },
    select: { id: true, name: true },
  });

  return Response.json({ household });
}
