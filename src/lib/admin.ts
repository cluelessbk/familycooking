import { auth } from "@/lib/auth";

export async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  return session.user.email === process.env.ADMIN_EMAIL;
}
