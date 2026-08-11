import { prisma } from "@/lib/db";
import { auditPublisherAction, authenticatePublisher, publisherAuthError, signRecipeTitle } from "@/lib/publisher-api";
import { fullRecipeInclude, recipeData, validateRecipePayload } from "@/lib/recipe-payload";

export async function GET(request: Request) {
  const publisher = await authenticatePublisher(request);
  if (!publisher || publisher.rateLimited) return publisherAuthError(publisher);

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  const categoryId = url.searchParams.get("categoryId")?.trim();
  const recipes = await prisma.recipe.findMany({
    where: {
      householdId: publisher.householdId,
      ...(query ? { title: { contains: query } } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: fullRecipeInclude,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  await auditPublisherAction(publisher.id, publisher.householdId, "RECIPE_LIST");
  return Response.json(recipes);
}

export async function POST(request: Request) {
  const publisher = await authenticatePublisher(request);
  if (!publisher || publisher.rateLimited) return publisherAuthError(publisher);

  let payload;
  try {
    payload = validateRecipePayload(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData(payload, signRecipeTitle(payload.title)),
        householdId: publisher.householdId,
      },
      include: fullRecipeInclude,
    });
    await auditPublisherAction(publisher.id, publisher.householdId, "RECIPE_CREATE", recipe.id);
    return Response.json(recipe, { status: 201 });
  } catch {
    return Response.json({ error: "Recipe could not be created; check referenced IDs" }, { status: 400 });
  }
}
