# Implementation Plan: Multi-User Auth + Household Data Isolation

> **Status:** NOT STARTED — pick up from Phase 1
> **Created:** 2026-03-27, session 2
> **Context:** App is currently single-family shared, auth disabled for local dev. Converting to multi-user with OTP auth and household-based data isolation.

---

## Overview

5 phases, each independently testable:
1. OTP Authentication (replace magic links)
2. Household Data Model (new tables + migration)
3. Data Isolation (all API routes get auth + household filtering)
4. Invite System (shareable link to join a household)
5. Cleanup (drop AllowedEmail, remove old scripts)

---

## Phase 1: OTP Authentication (replace magic links)

### Goal
Users enter email → receive 6-digit code → type code on same page → authenticated. No magic links, no passwords. Open registration (anyone can sign up).

### Files to modify

**`src/lib/auth.ts`** — Major rewrite:
- Remove the custom email provider (`id: "resend"`)
- Add `CredentialsProvider` from `next-auth/providers/credentials` with id `"otp"`
- Credentials: `email` (text), `code` (text), `inviteToken` (text, optional — used in Phase 4)
- `authorize` function:
  1. Look up `VerificationToken` where `identifier = email`, `token = code`, `expires > now()`
  2. If not found → return null (auth fails)
  3. Delete the used token
  4. Find or create User by email (`prisma.user.findUnique` / `prisma.user.create`)
  5. Return `{ id, email, name }`
- Switch to JWT session strategy: `session: { strategy: "jwt", maxAge: 90 * 24 * 60 * 60 }`
- Add `jwt` callback: attach `user.id` as `token.sub`
- Add `session` callback: expose `token.sub` as `session.user.id`
- Remove the `signIn` callback that checks AllowedEmail
- Keep `PrismaAdapter` (harmless, useful later)
- Keep `pages: { signIn: "/signin" }`

**`src/app/signin/page.tsx`** — Rewrite as 2-step flow:
- Step 1: Email entry → button "Изпрати код" → calls `POST /api/auth/send-code`
- Step 2: Code entry (6-digit) → button "Вход" → calls `signIn("otp", { email, code, redirect: false })`
- Show "Изпрати отново" with 60-second cooldown timer
- Show "Друг имейл" link to go back to step 1
- Error states: "Грешен или изтекъл код", "Нещо се обърка"
- Success: `router.push("/dashboard")`
- Read `?invite=TOKEN` from URL search params (for Phase 4 — pass through to signIn call)
- All UI in Bulgarian

### Files to create

**`src/app/api/auth/send-code/route.ts`** — New API route:
- Accept `POST { email }`
- Rate limit: check if VerificationToken for this email was created < 60 seconds ago → return 429
- Delete any existing VerificationToken rows for this email
- Generate 6-digit code: `Math.floor(100000 + Math.random() * 900000).toString()`
- Store in VerificationToken: `{ identifier: email, token: code, expires: now + 10 minutes }`
- Send email via Resend (plain text): "Твоят код за вход в FamilyCooking е: 123456\n\nКодът е валиден 10 минути."
- Always return 200 (don't reveal if email exists)

**`src/types/next-auth.d.ts`** — Type augmentation:
```ts
import "next-auth";
declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name?: string | null; image?: string | null };
  }
}
```

### Testing Phase 1
- Enter email → receive code in email → enter code → see dashboard
- Wrong code → error message
- Expired code → error message
- New email (not in AllowedEmail) → should still work (open registration)
- Session persists across page refreshes (90-day cookie)

---

## Phase 2: Household Data Model

### Goal
Add Household/HouseholdMember/InviteLink tables. Auto-create household on first sign-in. Migrate existing data.

### Schema changes (`prisma/schema.prisma`)

Add models:
```prisma
model Household {
  id        String   @id @default(cuid())
  name      String   @default("My Household")
  createdAt DateTime @default(now())
  members   HouseholdMember[]
  recipes   Recipe[]
  mealPlans MealPlan[]
  inviteLinks InviteLink[]
}

model HouseholdMember {
  id          String   @id @default(cuid())
  userId      String   @unique
  householdId String
  role        String   @default("OWNER")
  joinedAt    DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
}

model InviteLink {
  id          String   @id @default(cuid())
  token       String   @unique
  householdId String
  createdBy   String
  expiresAt   DateTime
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
}
```

Modify existing models:
- `User`: add `householdMember HouseholdMember?`
- `Recipe`: add `householdId String?` + `household Household? @relation(...)`
- `MealPlan`: add `householdId String?` + `household Household? @relation(...)`
- `MealPlan`: change unique from `@@unique([weekStart])` to `@@unique([weekStart, householdId])`

### Auth changes (`src/lib/auth.ts`)

In `authorize` function, after find-or-create User:
1. Check if user has a `HouseholdMember` entry
2. If not → create Household + HouseholdMember (role: OWNER)
3. Store `householdId` in the JWT token

Update `jwt` callback:
```ts
async jwt({ token, user }) {
  if (user) {
    token.sub = user.id;
    const member = await prisma.householdMember.findUnique({
      where: { userId: user.id },
      select: { householdId: true },
    });
    token.householdId = member?.householdId;
  }
  return token;
},
async session({ session, token }) {
  session.user.id = token.sub!;
  session.user.householdId = token.householdId as string;
  return session;
},
```

Update `src/types/next-auth.d.ts` to include `householdId` on session user.

### New files

**`src/lib/household.ts`** — Helper:
```ts
import { auth } from "@/lib/auth";

export async function requireHouseholdId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.householdId) {
    throw new Error("Unauthorized");
  }
  return session.user.householdId;
}
```

**`scripts/migrate-existing-data.ts`** — One-time migration:
1. Create a default "Family" Household
2. Find all existing Users → create HouseholdMember for each (role: OWNER for first user)
3. Update all Recipes: set householdId to default household
4. Update all MealPlans: set householdId to default household
5. Make idempotent (check if already done)

### Run migration
```bash
npx prisma migrate dev --name add_household_model
npx tsx scripts/migrate-existing-data.ts
```

---

## Phase 3: Data Isolation (API routes)

### Goal
Every API route gets: (1) auth check → 401, (2) householdId extraction, (3) filtered queries.

### Common pattern for EVERY route handler:
```ts
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user?.householdId) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
const householdId = session.user.householdId;
```

### Route-by-route changes:

| File | Method | Change |
|---|---|---|
| `api/recipes/route.ts` | GET | Add `where: { householdId, ...categoryFilter }` |
| `api/recipes/route.ts` | POST | Add `householdId` to `create` data |
| `api/recipes/[id]/route.ts` | GET | After find, verify `recipe.householdId === householdId` |
| `api/recipes/[id]/route.ts` | PUT | Same ownership check |
| `api/recipes/[id]/route.ts` | DELETE | Same ownership check |
| `api/planner/route.ts` | GET | `findUnique({ where: { weekStart_householdId: { weekStart, householdId } } })`, create with householdId |
| `api/planner/meals/route.ts` | POST | Verify mealPlan belongs to household before creating |
| `api/planner/meals/[mealId]/route.ts` | DELETE | Verify ownership via mealPlan join |
| `api/groceries/route.ts` | GET | Filter mealPlan by householdId |
| `api/groceries/generate/route.ts` | POST | Filter mealPlan by householdId |
| `api/groceries/[listId]/items/route.ts` | POST/DELETE | Verify list ownership via mealPlan |
| `api/groceries/items/[itemId]/route.ts` | PATCH/DELETE | Verify ownership via groceryList→mealPlan |
| `api/categories/route.ts` | GET/POST | Auth check only (categories stay global) |
| `api/upload/route.ts` | POST | Uncomment auth check, restore `auth()` import |

### Layout change (`src/app/(main)/layout.tsx`):
Remove `process.env.NODE_ENV !== "development"` guard. Always enforce auth:
```ts
const session = await auth();
if (!session) redirect("/signin");
```

### Dashboard change (`src/app/(main)/dashboard/page.tsx`):
MealPlan query needs householdId filter (server component — use `auth()` directly).

---

## Phase 4: Invite System

### Goal
Owner generates shareable link → sends via WhatsApp/Viber → invitee opens, signs in, joins household.

### New files:

**`src/app/api/household/invite/route.ts`**:
- POST: auth required, verify OWNER role, generate `crypto.randomUUID()` token, create InviteLink (7-day expiry), return URL
- GET: list active invite links for household (owner only)
- DELETE: revoke invite link (owner only)

**`src/app/join/[token]/page.tsx`**:
- Server component
- Look up InviteLink by token, verify not expired
- If invalid → "Тази покана е невалидна или изтекла"
- If valid → show household name + "Влез, за да се присъединиш" button → redirect to `/signin?invite=TOKEN`

**`src/app/(main)/settings/page.tsx`**:
- Show household name (editable by owner)
- Members list with roles
- "Генерирай линк за покана" button (owner only)
- Copy-to-clipboard for invite URL
- Add "Настройки" link to nav/header

### Auth changes for invite flow:

In `authorize` function of CredentialsProvider (`src/lib/auth.ts`):
- Read `credentials.inviteToken`
- If present:
  1. Validate InviteLink (exists, not expired)
  2. Get target householdId
  3. If user already has an empty household (0 recipes, 0 mealplans) → delete it
  4. Create/update HouseholdMember pointing to target household (role: MEMBER)
- If not present:
  - Auto-create household as before (Phase 2 behavior)

In sign-in page (`src/app/signin/page.tsx`):
- Read `invite` from `useSearchParams()`
- Pass as `inviteToken` credential to `signIn("otp", { email, code, inviteToken })`
- Show banner "Поканен/а си да се присъединиш към домакинство"

---

## Phase 5: Cleanup

- Remove `AllowedEmail` model from `prisma/schema.prisma`
- Delete `scripts/seed-email.ts`
- Update `.claude/CLAUDE.md` known issues (remove auth-disabled items)
- Update `Plan.md` checkboxes
- Consider removing `Account` and `Session` tables (no longer used with JWT) — optional, keeping them is harmless

---

## Key Technical Notes

- **CredentialsProvider requires JWT** — database sessions don't work with it. This is a NextAuth limitation.
- **householdId is baked into the JWT** at sign-in time. If a user joins a new household (invite flow), this happens during the sign-in process so the JWT already has the correct householdId.
- **Categories and MealSlots remain global** — no householdId needed. All users see the same preset categories.
- **GroceryList inherits isolation through MealPlan** — no householdId column needed on GroceryList or GroceryItem.
- **householdId columns are nullable** in the schema to support the migration path (existing data has null, migration script fills them in). After migration, they could be made required.
- **No new dependencies needed** — CredentialsProvider is built into next-auth.
- **Cost: $0** — same Resend free tier (3000 emails/month), same Turso free tier, same Vercel free tier.

---

## Build Order

```
Phase 1 (OTP auth) → test sign-in works
    ↓
Phase 2 (Household model) → run migration → test household auto-creation
    ↓
Phase 3 (Data isolation) → test each user sees only their data
    ↓
Phase 4 (Invite system) → test invite link flow
    ↓
Phase 5 (Cleanup) → drop AllowedEmail, finalize
```

Phases 2+3 should be deployed together (model + isolation).
Phase 1 can ship alone (auth works, data still shared).
Phase 4 can ship independently after 2+3.
