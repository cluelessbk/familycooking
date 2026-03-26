/**
 * Seeds preset meal slots into the database.
 * Usage: npx tsx scripts/seed-meal-slots.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const PRESET_SLOTS = [
  { name: "Breakfast", sortOrder: 1 },
  { name: "Lunch", sortOrder: 2 },
  { name: "Dinner", sortOrder: 3 },
];

async function seed() {
  console.log("Seeding preset meal slots...");

  for (const slot of PRESET_SLOTS) {
    const existing = await prisma.mealSlot.findUnique({ where: { name: slot.name } });

    if (existing) {
      console.log(`  Already exists: ${slot.name}`);
    } else {
      await prisma.mealSlot.create({ data: { ...slot, isPreset: true } });
      console.log(`  Created: ${slot.name}`);
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
