import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaLibSql as PrismaLibSqlWeb } from "@prisma/adapter-libsql/web";

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const config = { url, ...(authToken ? { authToken } : {}) };
  const adapter = authToken
    ? new PrismaLibSqlWeb(config)
    : new PrismaLibSql(config);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
