# Changelog

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
