import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.householdId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const membership = await prisma.householdMember.findUnique({ where: { userId: session.user.id } });
  if (membership?.role !== "OWNER") return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const result = await prisma.publisherApiKey.updateMany({
    where: { id, householdId: session.user.householdId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (!result.count) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}
