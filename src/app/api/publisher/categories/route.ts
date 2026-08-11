import { prisma } from "@/lib/db";
import { auditPublisherAction, authenticatePublisher, publisherAuthError } from "@/lib/publisher-api";

export async function GET(request: Request) {
  const publisher = await authenticatePublisher(request);
  if (!publisher || publisher.rateLimited) return publisherAuthError(publisher);
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  await auditPublisherAction(publisher.id, publisher.householdId, "CATEGORY_LIST");
  return Response.json(categories);
}
