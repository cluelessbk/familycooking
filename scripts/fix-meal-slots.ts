import { prisma } from "../src/lib/db";

const updates = [
  { from: "Breakfast", to: "Закуска" },
  { from: "Lunch", to: "Обяд" },
  { from: "Dinner", to: "Вечеря" },
];

for (const { from, to } of updates) {
  const slot = await prisma.mealSlot.findUnique({ where: { name: from } });
  if (slot) {
    await prisma.mealSlot.update({ where: { id: slot.id }, data: { name: to } });
    console.log(`${from} → ${to}`);
  } else {
    console.log(`Not found: ${from}`);
  }
}

const all = await prisma.mealSlot.findMany({ orderBy: { sortOrder: "asc" } });
console.log("Current slots:", all.map((s) => s.name));
await prisma.$disconnect();
