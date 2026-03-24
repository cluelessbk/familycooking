# Changelog

## [0.2.0] - 2026-03-24

### Added
- Full app scaffolding: Prisma schema with Recipe, Ingredient, Step, Category models backed by Turso/libSQL
- Recipe CRUD: list, detail, create, edit, delete pages with full form handling
- NextAuth v5 sign-in flow with Resend magic-link email
- API routes for recipes and categories
- Dashboard page
- **FlowchartSteps component** (`src/components/recipes/flowchart-steps.tsx`) — interactive vertical flowchart replacing the basic step list on the recipe detail page; each step is a tappable card with orange connector arrows between steps
- Ingredients section on recipe detail page updated to a clean two-column layout (name left, quantity+unit right) with subtle divider lines
