/**
 * Seeds the first allowed email (admin) into the database.
 * Usage: npx tsx scripts/seed-email.ts your@email.com
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx scripts/seed-email.ts your@email.com");
  process.exit(1);
}

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const existing = await prisma.allowedEmail.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`Email already allowed: ${email}`);
  } else {
    await prisma.allowedEmail.create({
      data: { email },
    });
    console.log(`Added allowed email: ${email}`);
  }
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
