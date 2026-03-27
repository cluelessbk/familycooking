/**
 * Seeds categories and meal slots into the production Turso database.
 * Run with: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/seed-production.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  "Закуски", "Супи", "Салати", "Основни ястия",
  "Гарнитури", "Десерти", "Снаксове", "Напитки", "Хляб",
];

const MEAL_SLOTS = [
  { name: "Закуска", sortOrder: 1 },
  { name: "Обяд", sortOrder: 2 },
  { name: "Вечеря", sortOrder: 3 },
];

async function seed() {
  console.log("Seeding categories...");
  for (const name of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) { console.log(`  skip: ${name}`); continue; }
    await prisma.category.create({ data: { name, isPreset: true } });
    console.log(`  created: ${name}`);
  }

  console.log("Seeding meal slots...");
  for (const slot of MEAL_SLOTS) {
    const existing = await prisma.mealSlot.findUnique({ where: { name: slot.name } });
    if (existing) { console.log(`  skip: ${slot.name}`); continue; }
    await prisma.mealSlot.create({ data: { ...slot, isPreset: true } });
    console.log(`  created: ${slot.name}`);
  }

  console.log("Done.");
}

seed()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
