import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ isPreset: "desc" }, { name: "asc" }],
  });

  return Response.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return Response.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { name, isPreset: false },
  });

  return Response.json(category, { status: 201 });
}
