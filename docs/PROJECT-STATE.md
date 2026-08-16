# Project State

Updated: 2026-08-16

## Current work

Version 1.4.1 is implemented locally. In addition to the Air Fryer suitability flag and filter from v1.4.0, the Air Fryer list now has a searchable multi-select picker. It preselects current Air Fryer recipes and saves additions/removals in one household-scoped operation. The picker replaces the empty-state new-recipe action while the Air Fryer filter is active and remains available when the list has recipes.

## Verification

- Prisma client generation passes with the new `airFryerSuitable` field and migration.
- Targeted ESLint passes with no errors (four pre-existing image optimization warnings remain).
- Next.js 16.2.1 production build and TypeScript validation pass.
- `git diff --check` passes.
- The mobile fix covers all `input`, `textarea`, and `select` controls globally, while excluding checkbox and radio controls.
- The v1.4.1 production build, TypeScript validation, targeted ESLint, and `git diff --check` pass.
- Bulk updates are restricted to recipe IDs in the signed-in user's household.

## Next action

Rumen should review v1.4.1 at `https://familycooking-af-preview.vercel.app`. If approved, push the two local commits and deploy/promote v1.4.1 to production. Production remains on v1.3.1 until explicit approval.
