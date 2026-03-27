# FamilyCooking — Project Notes

## Known Issues

1. **Steps "active" state is visual only** — tapping a flowchart step highlights it but doesn't persist or affect any data
2. **No tests exist** — the project has no test suite; `npm run build` is the only verification step available
3. **Recipe upload via curl mangles Cyrillic** — use Prisma seed scripts (like `seed-recipe1.ts`) instead of curl for seeding Bulgarian text
4. **Upload route auth disabled for local testing** — `src/app/api/upload/route.ts` has auth check commented out; must re-enable before production deploy
5. **Auth entirely disabled for local dev** — `src/app/(main)/layout.tsx` skips session check in development; must review auth flow before production deploy
