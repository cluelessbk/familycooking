# FamilyCooking — Project Notes

## Known Issues

1. **Steps "active" state is visual only** — tapping a flowchart step highlights it but doesn't persist or affect any data
2. **No tests exist** — the project has no test suite; `npm run build` is the only verification step available
3. **Household name is not editable** — settings page shows the name but has no edit UI yet
4. **Shared recipe photo is a URL reference** — copied recipes point to the original photo URL; if the original recipe is deleted, the photo breaks
5. **MealPlan unique constraint uses nullable householdId** — schema could be tightened to non-nullable after confirming all data is migrated
