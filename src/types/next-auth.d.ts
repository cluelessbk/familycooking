import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      householdId: string;
      householdRole: "OWNER" | "MEMBER";
      name?: string | null;
      image?: string | null;
    };
  }
}
