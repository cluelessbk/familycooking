CREATE TABLE "PublisherApiKey" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "householdId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "keyPrefix" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" DATETIME,
  "revokedAt" DATETIME,
  CONSTRAINT "PublisherApiKey_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PublisherApiKey_keyHash_key" ON "PublisherApiKey"("keyHash");
CREATE INDEX "PublisherApiKey_householdId_idx" ON "PublisherApiKey"("householdId");

CREATE TABLE "PublisherAuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "householdId" TEXT NOT NULL,
  "apiKeyId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "recipeId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublisherAuditLog_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PublisherAuditLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "PublisherApiKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PublisherAuditLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "PublisherAuditLog_householdId_createdAt_idx" ON "PublisherAuditLog"("householdId", "createdAt");
CREATE INDEX "PublisherAuditLog_recipeId_idx" ON "PublisherAuditLog"("recipeId");

CREATE TABLE "PublisherRateLimit" (
  "apiKeyId" TEXT NOT NULL PRIMARY KEY,
  "windowStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "PublisherRateLimit_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "PublisherApiKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
