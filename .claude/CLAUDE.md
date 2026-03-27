# FamilyCooking — Project Notes

## Known Issues

1. **Steps "active" state is visual only** — tapping a flowchart step highlights it but doesn't persist or affect any data
2. **No tests exist** — the project has no test suite; `npm run build` is the only verification step available
3. **Recipe upload via curl mangles Cyrillic** — use Prisma seed scripts (like `seed-recipe1.ts`) instead of curl for seeding Bulgarian text
4. **Household name is not editable** — settings page shows the name but has no edit UI yet
5. **MealPlan unique constraint uses nullable householdId** — existing null rows from pre-migration data won't collide but schema could be tightened to non-nullable after confirming all data is migrated
