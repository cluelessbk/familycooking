import { put } from "@vercel/blob";
// import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  // TODO: re-enable auth check before deploying to production
  // const session = await auth();
  // if (!session) {
  //   return Response.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const blob = await put(`recipes/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return Response.json({ url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Blob upload failed:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
