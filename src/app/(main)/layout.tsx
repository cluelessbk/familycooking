import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.householdId) {
    redirect("/signin");
  }

  return (
    <>
      <Header isOwner={session.user.householdRole === "OWNER"} />
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full pb-24 sm:pb-4">
        {children}
      </main>
    </>
  );
}
