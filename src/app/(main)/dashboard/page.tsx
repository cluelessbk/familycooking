import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        Добре дошли във FamilyCooking
      </h1>
      <p className="text-muted">
        Влезли сте като <strong>{session?.user?.email}</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardCard
          title="Рецепти"
          description="Разгледайте и добавете семейни рецепти"
          href="/recipes"
        />
        <DashboardCard
          title="Планер"
          description="Планирайте храненията за седмицата"
          href="/planner"
        />
        <DashboardCard
          title="Пазаруване"
          description="Списъкът ви за пазаруване за седмицата"
          href="/groceries"
        />
        <DashboardCard
          title="Днес"
          description="Вижте какво е планирано за днес"
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
