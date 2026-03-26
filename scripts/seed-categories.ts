/**
 * Seeds preset categories into the database.
 * Usage: npx tsx scripts/seed-categories.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const PRESET_CATEGORIES = [
  "Закуски",
  "Супи",
  "Салати",
  "Основни ястия",
  "Гарнитури",
  "Десерти",
  "Снаксове",
  "Напитки",
];

async function seed() {
  console.log("Seeding preset categories...");

  for (const name of PRESET_CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { name } });

    if (existing) {
      console.log(`  Already exists: ${name}`);
    } else {
      await prisma.category.create({ data: { name, isPreset: true } });
      console.log(`  Created: ${name}`);
    }
  }

  console.log("Done.");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
