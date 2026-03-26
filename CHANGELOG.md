# Changelog

## [0.5.0] - 2026-03-26

### Added
- **Grocery list page** (`/groceries`) — week selector with prev/next navigation
- **Auto-generate from meal plan** — pulls all planned meals for the week, flattens ingredients, merges by name + unit (summing quantities), creates the list in one click
- **Regenerate** — updates auto-generated items while preserving manually added ones
- **Check-off items** — tap checkbox to strike through items while shopping; optimistic UI update
- **Manual add** — form at the bottom to add any item with optional quantity and unit
- **Remove items** — × button on every item
- **Grocery API routes** — `GET /api/groceries`, `POST /api/groceries/generate`, `POST /api/groceries/[listId]/items`, `PATCH+DELETE /api/groceries/items/[itemId]`
- **First recipe seeded** — Нахут с пилешко added via Prisma seed script (curl encoding workaround)

## [0.4.0] - 2026-03-26

### Added
- **Weekly meal planner** (`/planner`) — grid of Mon–Sun × meal slots with prev/next week navigation
- **Daily view** (`/today`) — shows today's planned meals with links to recipes
- **Multiple recipes per slot** — removed unique constraint; can assign e.g. salad + soup to the same dinner slot
- **Recipe picker modal** — searchable list in the planner; includes "Нова рецепта" button opening `/recipes/new` in a new tab
- **Planner API** — `GET /api/planner`, `POST /api/planner/meals`, `DELETE /api/planner/meals/[mealId]`
- **Meal slot seed script** (`scripts/seed-meal-slots.ts`) — seeds Закуска, Обяд, Вечеря

### Fixed
- `db.ts` used `??` to fall back to local SQLite URL, which silently failed when `TURSO_DATABASE_URL=""` (empty string); changed to `||`

### Changed
- All UI text translated to Bulgarian across nav, recipes page, and planner
- Category names in DB translated to Bulgarian (Закуски, Супи, Салати, Основни ястия, Гарнитури, Десерти, Снаксове, Напитки)

## [0.3.0] - 2026-03-25

### Added
- **Photo upload** — Vercel Blob integration; Add/Edit recipe forms now include a photo picker with live preview; recipe cards and detail page show the actual photo instead of the placeholder emoji
- **Mobile bottom navigation** — replaced cramped header nav with a fixed bottom tab bar (Recipes / Planner / Groceries with icons) on mobile; desktop keeps the original horizontal nav
- **Auth bypass in dev** — protected routes skip authentication when running locally (`NODE_ENV=development`) so testing doesn't require sign-in
- **Recipe template** — `recipe_template.txt` defines the canonical format for all recipes (ingredients with quantity/unit/name, description, steps); used for the upcoming bulk import

### Changed
- Plain text parser replaced by a template-based approach: recipes will be converted to the structured format by Claude and bulk-seeded via script


## [0.2.0] - 2026-03-24

### Added
- Full app scaffolding: Prisma schema with Recipe, Ingredient, Step, Category models backed by Turso/libSQL
- Recipe CRUD: list, detail, create, edit, delete pages with full form handling
- NextAuth v5 sign-in flow with Resend magic-link email
- API routes for recipes and categories
- Dashboard page
- **FlowchartSteps component** (`src/components/recipes/flowchart-steps.tsx`) — interactive vertical flowchart replacing the basic step list on the recipe detail page; each step is a tappable card with orange connector arrows between steps
- Ingredients section on recipe detail page updated to a clean two-column layout (name left, quantity+unit right) with subtle divider lines
