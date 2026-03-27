import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.householdId) redirect("/signin");
  const householdId = session.user.householdId;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monday = getMondayOf(now);

  const todayLabel = now.toLocaleDateString("bg-BG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Fetch today's meals
  const plan = await prisma.mealPlan.findUnique({
    where: { weekStart_householdId: { weekStart: monday, householdId } },
  });

  const [slots, todayMeals] = await Promise.all([
    prisma.mealSlot.findMany({ orderBy: { sortOrder: "asc" } }),
    plan
      ? prisma.plannedMeal.findMany({
          where: {
            mealPlanId: plan.id,
            date: new Date(todayStr),
          },
          include: { recipe: { select: { id: true, title: true } } },
        })
      : Promise.resolve([]),
  ]);

  const hasAnythingToday = todayMeals.length > 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">FamilyCooking</h1>
        <p className="text-muted text-sm capitalize mt-1">{todayLabel}</p>
      </div>

      {/* Today's meals */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Днес</h2>

        {slots.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-5 text-center space-y-2">
            <p className="text-muted text-sm">Все още няма добавени хранения.</p>
            <Link href="/planner" className="text-sm text-primary hover:underline">
              Отиди в плановика →
            </Link>
          </div>
        ) : !hasAnythingToday ? (
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <p className="text-muted text-sm">Нищо не е планирано за днес.</p>
            <Link href="/planner" className="text-sm text-primary hover:underline">
              Планирай седмицата →
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {slots.map((slot) => {
              const meals = todayMeals.filter((m) => m.mealSlotId === slot.id);
              if (meals.length === 0) return null;
              return (
                <div key={slot.id} className="flex items-start gap-4 px-5 py-4">
                  <span className="w-20 shrink-0 text-sm text-muted pt-0.5">{slot.name}</span>
                  <div className="flex flex-col gap-2 flex-1">
                    {meals.map((meal, i) => (
                      <Link
                        key={meal.id}
                        href={`/recipes/${meal.recipe.id}?from=today`}
                        className={`flex items-start gap-2 text-foreground font-medium hover:text-primary transition-colors text-sm ${
                          meals.length > 1 && i > 0 ? "pt-2 border-t border-border" : ""
                        }`}
                      >
                        {meals.length > 1 && (
                          <span className="text-primary font-bold shrink-0 mt-0.5 text-sm">{i + 1}.</span>
                        )}
                        {meal.recipe.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasAnythingToday && (
          <Link href="/today" className="text-sm text-primary hover:underline block">
            Виж пълния ден →
          </Link>
        )}
      </section>

      {/* Quick links */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Навигация</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/recipes"
            className="block p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all"
          >
            <p className="font-semibold text-foreground text-sm">Рецепти</p>
            <p className="text-xs text-muted mt-0.5">Разгледай семейните рецепти</p>
          </Link>
          <Link
            href="/planner"
            className="block p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all"
          >
            <p className="font-semibold text-foreground text-sm">Планер</p>
            <p className="text-xs text-muted mt-0.5">Планирай хранения за седмицата</p>
          </Link>
          <Link
            href="/groceries"
            className="block p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all"
          >
            <p className="font-semibold text-foreground text-sm">Пазаруване</p>
            <p className="text-xs text-muted mt-0.5">Списък за пазаруване</p>
          </Link>
          <Link
            href="/today"
            className="block p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all"
          >
            <p className="font-semibold text-foreground text-sm">Днес</p>
            <p className="text-xs text-muted mt-0.5">Какво е планирано за днес</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
