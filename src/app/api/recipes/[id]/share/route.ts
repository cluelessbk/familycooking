import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.householdId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const householdId = session.user.householdId;
  const userId = session.user.id;

  const { id } = await params;

  // Verify the recipe belongs to the user's household
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { householdId: true },
  });

  if (!recipe || recipe.householdId !== householdId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Idempotent: return existing token if one exists
  const existing = await prisma.shareToken.findFirst({
    where: { recipeId: id },
  });

  const token = existing
    ? existing.token
    : (
        await prisma.shareToken.create({
          data: { recipeId: id, createdBy: userId },
        })
      ).token;

  const shareUrl = `${process.env.NEXTAUTH_URL}/recipes/shared/${token}`;

  return Response.json({ shareUrl });
}
