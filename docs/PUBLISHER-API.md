# Recipe Publisher API

The publisher API gives a trusted integration access to recipes in exactly one household. Household owners create and revoke keys in Settings. Raw keys are displayed once; only SHA-256 hashes are stored.

Authenticate every request with `Authorization: Bearer <key>`. The limit is 120 requests per minute per key.

## Endpoints

- `GET /api/publisher/categories`
- `GET /api/publisher/recipes?q=<title>&categoryId=<id>`
- `POST /api/publisher/recipes`
- `GET /api/publisher/recipes/:id`
- `PUT /api/publisher/recipes/:id`
- `DELETE /api/publisher/recipes/:id` with `X-Confirm-Delete: <id>`
- `POST /api/publisher/upload` with multipart field `file` (images only, maximum 10 MB)

Create and update bodies accept `title`, `description`, `photoUrl`, `categoryId`, `servings`, `prepTime`, `cookTime`, `ingredients`, and `steps`. Creating a recipe appends `(Jarvis)` exactly once. Updating a recipe uses the supplied title unchanged.

All recipe lookup and mutation queries include the authenticated key's household ID. Cross-household IDs return `404`.
