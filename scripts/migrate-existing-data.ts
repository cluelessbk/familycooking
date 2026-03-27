/**
 * One-time migration: assign all existing recipes and meal plans to a default household.
 * Safe to run multiple times (idempotent).
 *
 * Run with: npx tsx scripts/migrate-existing-data.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting data migration...");

  // Check if migration was already done
  const existingHousehold = await prisma.household.findFirst({
    where: { name: "Family" },
  });

  if (existingHousehold) {
    // Check if all recipes already have a household
    const unassignedRecipes = await prisma.recipe.count({
      where: { householdId: null },
    });
    const unassignedPlans = await prisma.mealPlan.count({
      where: { householdId: null },
    });

    if (unassignedRecipes === 0 && unassignedPlans === 0) {
      console.log("Migration already complete. Nothing to do.");
      return;
    }
  }

  // Create (or reuse) the default household
  const household = existingHousehold ?? (await prisma.household.create({
    data: { name: "Family" },
  }));
  console.log(`Using household: ${household.id} (${household.name})`);

  // Assign all existing users to this household (if they don't already have one)
  const users = await prisma.user.findMany({
    where: { householdMember: null },
  });

  for (const user of users) {
    await prisma.householdMember.create({
      data: {
        userId: user.id,
        householdId: household.id,
        role: "OWNER",
      },
    });
    console.log(`  Assigned user ${user.email} to household`);
  }

  // Assign all orphaned recipes to the default household
  const recipeResult = await prisma.recipe.updateMany({
    where: { householdId: null },
    data: { householdId: household.id },
  });
  console.log(`  Updated ${recipeResult.count} recipes`);

  // Assign all orphaned meal plans to the default household
  const planResult = await prisma.mealPlan.updateMany({
    where: { householdId: null },
    data: { householdId: household.id },
  });
  console.log(`  Updated ${planResult.count} meal plans`);

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
