import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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
    myRole: myMember?.role ?? "MEMBER",
  });
}
