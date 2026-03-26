import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const RENAMES: [string, string][] = [
  ["Breakfasts", "Закуски"],
  ["Soups", "Супи"],
  ["Salads", "Салати"],
  ["Main Dishes", "Основни ястия"],
  ["Side Dishes", "Гарнитури"],
  ["Desserts", "Десерти"],
  ["Snacks", "Снаксове"],
  ["Drinks", "Напитки"],
];

async function run() {
  for (const [from, to] of RENAMES) {
    const result = await prisma.category.updateMany({ where: { name: from }, data: { name: to } });
    console.log(result.count ? `  ${from} → ${to}` : `  Not found: ${from}`);
  }
  console.log("Done.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
