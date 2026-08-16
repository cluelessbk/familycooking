import { prisma } from "@/lib/db";
import { auditPublisherAction, authenticatePublisher, publisherAuthError } from "@/lib/publisher-api";
import { fullRecipeInclude, recipeData, validateRecipePayload } from "@/lib/recipe-payload";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const publisher = await authenticatePublisher(request);
  if (!publisher || publisher.rateLimited) return publisherAuthError(publisher);
  const { id } = await params;
  const recipe = await prisma.recipe.findFirst({
    where: { id, householdId: publisher.householdId },
    include: fullRecipeInclude,
  });
  if (!recipe) return Response.json({ error: "Not found" }, { status: 404 });
  await auditPublisherAction(publisher.id, publisher.householdId, "RECIPE_READ", id);
  return Response.json(recipe);
}

export async function PUT(request: Request, { params }: Context) {
  const publisher = await authenticatePublisher(request);
  if (!publisher || publisher.rateLimited) return publisherAuthError(publisher);
  const { id } = await params;
  const existing = await prisma.recipe.findFirst({ where: { id, householdId: publisher.householdId }, select: { id: true } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  let payload;
  try {
    payload = validateRecipePayload(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    const recipe = await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      await tx.recipeStep.deleteMany({ where: { recipeId: id } });
      await tx.recipeCookingMethod.deleteMany({ where: { recipeId: id } });
      return tx.recipe.update({
        where: { id },
        data: recipeData(payload),
        include: fullRecipeInclude,
      });
    });
    await auditPublisherAction(publisher.id, publisher.householdId, "RECIPE_UPDATE", id);
    return Response.json(recipe);
  } catch {
    return Response.json({ error: "Recipe could not be updated; check referenced IDs" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const publisher = await authenticatePublisher(request);
  if (!publisher || publisher.rateLimited) return publisherAuthError(publisher);
  const { id } = await params;
  if (request.headers.get("x-confirm-delete") !== id) {
    return Response.json({ error: "Set X-Confirm-Delete to the recipe ID" }, { status: 400 });
  }
  const existing = await prisma.recipe.findFirst({ where: { id, householdId: publisher.householdId }, select: { id: true } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
  await prisma.recipe.delete({ where: { id } });
  await auditPublisherAction(publisher.id, publisher.householdId, "RECIPE_DELETE");
  return Response.json({ success: true });
}
