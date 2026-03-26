# FamilyCooking — Project Notes

## Known Issues

1. **Steps "active" state is visual only** — tapping a flowchart step highlights it but doesn't persist or affect any data
2. **No tests exist** — the project has no test suite; `npm run build` is the only verification step available
3. **Bulk recipe import not yet built** — recipes will be converted to template format and seeded via script; pending user providing all recipes
4. **Plain text recipe parser not built** — deferred from Phase 2; converts raw pasted text into structured ingredients/steps
5. **Recipe upload via curl mangles Cyrillic** — use Prisma seed scripts (like `seed-recipe1.ts`) instead of curl for seeding Bulgarian text
