import { put } from "@vercel/blob";
import { auditPublisherAction, authenticatePublisher, publisherAuthError } from "@/lib/publisher-api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const publisher = await authenticatePublisher(request);
  if (!publisher || publisher.rateLimited) return publisherAuthError(publisher);

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "Only image files are allowed" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: "Image must be 10 MB or smaller" }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  try {
    const blob = await put(`recipes/${publisher.householdId}/${Date.now()}-${safeName}`, file, { access: "public" });
    await auditPublisherAction(publisher.id, publisher.householdId, "PHOTO_UPLOAD");
    return Response.json({ url: blob.url });
  } catch (error) {
    console.error("Publisher blob upload failed", error instanceof Error ? error.message : error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
