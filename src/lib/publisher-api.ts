import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

const KEY_PREFIX = "fcp_live_";
const RATE_LIMIT = 120;
const WINDOW_MS = 60_000;

export function hashPublisherKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export function createPublisherKey() {
  const secret = randomBytes(32).toString("base64url");
  const key = `${KEY_PREFIX}${secret}`;
  return { key, keyHash: hashPublisherKey(key), keyPrefix: key.slice(0, 16) };
}

export function signRecipeTitle(title: string) {
  const trimmed = title.trim();
  return /\(Jarvis\)$/i.test(trimmed) ? trimmed.replace(/\(jarvis\)$/i, "(Jarvis)") : `${trimmed} (Jarvis)`;
}

export async function authenticatePublisher(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const rawKey = authorization.slice(7).trim();
  if (!rawKey.startsWith(KEY_PREFIX)) return null;

  const apiKey = await prisma.publisherApiKey.findUnique({
    where: { keyHash: hashPublisherKey(rawKey) },
    select: { id: true, householdId: true, revokedAt: true },
  });
  if (!apiKey || apiKey.revokedAt) return null;

  const now = new Date();
  const rate = await prisma.publisherRateLimit.findUnique({ where: { apiKeyId: apiKey.id } });
  if (!rate || now.getTime() - rate.windowStart.getTime() >= WINDOW_MS) {
    await prisma.publisherRateLimit.upsert({
      where: { apiKeyId: apiKey.id },
      create: { apiKeyId: apiKey.id, windowStart: now, requestCount: 1 },
      update: { windowStart: now, requestCount: 1 },
    });
  } else {
    if (rate.requestCount >= RATE_LIMIT) return { ...apiKey, rateLimited: true as const };
    await prisma.publisherRateLimit.update({
      where: { apiKeyId: apiKey.id },
      data: { requestCount: { increment: 1 } },
    });
  }

  await prisma.publisherApiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: now } });
  return { ...apiKey, rateLimited: false as const };
}

export function publisherAuthError(authResult: Awaited<ReturnType<typeof authenticatePublisher>>) {
  if (authResult?.rateLimited) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": "60" } });
  }
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function auditPublisherAction(apiKeyId: string, householdId: string, action: string, recipeId?: string) {
  await prisma.publisherAuditLog.create({
    data: { apiKeyId, householdId, action, recipeId: recipeId ?? null },
  });
}
