/**
 * Seeds the first recipe: Нахут с пилешко
 * Usage: npx tsx scripts/seed-recipe1.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function seed() {
  // Remove any existing broken version
  await prisma.recipe.deleteMany({ where: { title: { contains: "?" } } });

  const category = await prisma.category.findUnique({ where: { name: "Основни ястия" } });
  if (!category) {
    console.error("Category 'Основни ястия' not found. Run seed-categories first.");
    process.exit(1);
  }

  const recipe = await prisma.recipe.create({
    data: {
      title: "Нахут с пилешко",
      description: "Задушено пилешко с нахут и зеленчуци в ароматен сос. Сервира се със сварен ориз.",
      categoryId: category.id,
      servings: 4,
      prepTime: 15,
      cookTime: 45,
      ingredients: {
        create: [
          { name: "пилешко месо", quantity: 500, unit: "г" },
          { name: "чушка", quantity: 1, unit: "бр" },
          { name: "моркова", quantity: 2, unit: "бр" },
          { name: "лук", quantity: 1, unit: "глава" },
          { name: "чесън", quantity: 3, unit: "скилидки" },
          { name: "картофа", quantity: 2, unit: "бр" },
          { name: "нахут (изцеден)", quantity: null, unit: null },
          { name: "мащерка", quantity: null, unit: null },
          { name: "къри", quantity: null, unit: null },
          { name: "червен пипер", quantity: null, unit: null },
          { name: "черен пипер", quantity: null, unit: null },
          { name: "домат или доматен сос", quantity: null, unit: null },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, instruction: "Задушете нарязаното месо в мазнина със сол, черен пипер, мащерка и чесън до лек загар." },
          { stepNumber: 2, instruction: "Добавете нарязаните зеленчуци и изцедения нахут и разбъркайте." },
          { stepNumber: 3, instruction: "Добавете подправките и разбъркайте добре." },
          { stepNumber: 4, instruction: "Налейте вряща вода да покрива на около 1 см над всичко." },
          { stepNumber: 5, instruction: "Добавете нарязания домат или доматен сос." },
          { stepNumber: 6, instruction: "Оставете да къкри докато зеленчуците омекнат." },
          { stepNumber: 7, instruction: "Поръсете с нарязан магданоз и сервирайте със сварен ориз." },
        ],
      },
    },
  });

  console.log(`Created: ${recipe.title} (id: ${recipe.id})`);
  console.log("Done.");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
