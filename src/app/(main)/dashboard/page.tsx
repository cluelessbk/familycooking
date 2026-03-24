import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        Welcome to FamilyCooking
      </h1>
      <p className="text-muted">
        Signed in as <strong>{session?.user?.email}</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardCard
          title="Recipes"
          description="Browse and add your family recipes"
          href="/recipes"
        />
        <DashboardCard
          title="Meal Plan"
          description="Plan your meals for the week"
          href="/planner"
        />
        <DashboardCard
          title="Grocery List"
          description="Your shopping list for the week"
          href="/groceries"
        />
        <DashboardCard
          title="Today"
          description="See what's cooking today"
          href="/today"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all"
    >
      <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted">{description}</p>
    </a>
  );
}
