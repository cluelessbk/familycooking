CREATE TABLE "CookingMethod" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "color" TEXT NOT NULL
);

CREATE TABLE "RecipeCookingMethod" (
  "recipeId" TEXT NOT NULL,
  "cookingMethodId" TEXT NOT NULL,
  PRIMARY KEY ("recipeId", "cookingMethodId"),
  CONSTRAINT "RecipeCookingMethod_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RecipeCookingMethod_cookingMethodId_fkey" FOREIGN KEY ("cookingMethodId") REFERENCES "CookingMethod" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "CookingMethod" ("id", "name", "icon", "color") VALUES
  ('air-fryer', 'Еър фрайър', '♨️', 'teal'),
  ('pressure-cooker', 'Тенджера под налягане', '🍲', 'violet');

INSERT INTO "RecipeCookingMethod" ("recipeId", "cookingMethodId")
SELECT "id", 'air-fryer' FROM "Recipe" WHERE "airFryerSuitable" = true;
