# Project State

Updated: 2026-08-16

## Current work

Version 1.4.0 is implemented locally. Recipes now have an independent Air Fryer suitability flag, editable in both create and edit forms, visible as a badge, preserved when recipes are copied, and filterable together with any category. A global mobile form-control rule prevents iOS Safari's automatic focus zoom by keeping editable controls at a minimum 16px font size on phone widths.

## Verification

- Prisma client generation passes with the new `airFryerSuitable` field and migration.
- Targeted ESLint passes with no errors (four pre-existing image optimization warnings remain).
- Next.js 16.2.1 production build and TypeScript validation pass.
- `git diff --check` passes.
- The mobile fix covers all `input`, `textarea`, and `select` controls globally, while excluding checkbox and radio controls.

## Next action

Push and deploy v1.4.0 after Rumen's approval, then verify the production migration and Air Fryer API filter.
