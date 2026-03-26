import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ mealId: string }> }
) {
  const { mealId } = await params;

  await prisma.plannedMeal.delete({ where: { id: mealId } });

  return Response.json({ ok: true });
}
