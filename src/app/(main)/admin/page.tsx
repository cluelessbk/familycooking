import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminPanel } from "./AdminPanel";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.householdId) redirect("/signin");
  if (session.user.householdRole !== "OWNER") redirect("/settings");

  return <AdminPanel />;
}
