import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      id: "otp",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Code", type: "text" },
        inviteToken: { label: "Invite Token", type: "text" },
      },
      async authorize(credentials) {
        const rawEmail = credentials.email as string | undefined;
        const code = credentials.code as string | undefined;
        const email = rawEmail?.trim().toLowerCase();

        if (!email || !code) return null;

        // Find a valid, non-expired token
        const verificationToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: email,
            token: code,
            expires: { gt: new Date() },
          },
        });

        if (!verificationToken) return null;

        const inviteToken = credentials.inviteToken as string | undefined;
        const invite = inviteToken
          ? await prisma.inviteLink.findFirst({
              where: { token: inviteToken, expiresAt: { gt: new Date() } },
              select: { householdId: true },
            })
          : null;
        if (inviteToken && !invite) return null;

        const user = await prisma.$transaction(async (tx) => {
          let currentUser = await tx.user.findUnique({ where: { email } });
          const existingMember = currentUser
            ? await tx.householdMember.findUnique({ where: { userId: currentUser.id } })
            : null;

          // An invite is for registration, not for silently moving an existing
          // account (and its data) between households.
          if (invite && existingMember && existingMember.householdId !== invite.householdId) {
            return null;
          }

          await tx.verificationToken.delete({
            where: { identifier_token: { identifier: email, token: code } },
          });

          if (!currentUser) {
            currentUser = await tx.user.create({
              data: { email, emailVerified: new Date() },
            });
          }

          if (invite && !existingMember) {
            const consumed = await tx.inviteLink.deleteMany({
              where: { token: inviteToken, expiresAt: { gt: new Date() } },
            });
            if (consumed.count !== 1) throw new Error("Invite already used");
            await tx.householdMember.create({
              data: { userId: currentUser.id, householdId: invite.householdId, role: "MEMBER" },
            });
          } else if (!existingMember) {
            const household = await tx.household.create({ data: { name: "My Household" } });
            await tx.householdMember.create({
              data: { userId: currentUser.id, householdId: household.id, role: "OWNER" },
            });
          }

          return currentUser;
        });

        if (!user) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60, // 90 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      const member = token.sub
        ? await prisma.householdMember.findUnique({
            where: { userId: token.sub },
            select: { householdId: true, role: true },
          })
        : null;
      token.householdId = member?.householdId;
      token.householdRole = member?.role;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.householdId = token.householdId as string;
      session.user.householdRole = token.householdRole as "OWNER" | "MEMBER";
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
