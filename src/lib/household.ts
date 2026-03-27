import { auth } from "@/lib/auth";

export async function requireHouseholdId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.householdId) {
    throw new Error("Unauthorized");
  }
  return session.user.householdId;
}
