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
        const email = credentials.email as string | undefined;
        const code = credentials.code as string | undefined;

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

        // Delete the used token
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: email,
              token: code,
            },
          },
        });

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: { email, emailVerified: new Date() },
          });
        }

        const inviteToken = credentials.inviteToken as string | undefined;

        if (inviteToken) {
          // Invite flow: join an existing household
          const invite = await prisma.inviteLink.findUnique({
            where: { token: inviteToken },
            select: { householdId: true, expiresAt: true },
          });

          if (invite && invite.expiresAt > new Date()) {
            const existingMember = await prisma.householdMember.findUnique({
              where: { userId: user.id },
              include: {
                household: {
                  select: {
                    _count: { select: { recipes: true, mealPlans: true } },
                  },
                },
              },
            });

            // If the user has an empty household (created on registration), delete it
            if (existingMember) {
              const counts = existingMember.household._count;
              if (counts.recipes === 0 && counts.mealPlans === 0) {
                await prisma.household.delete({ where: { id: existingMember.householdId } });
              } else {
                // Already has data — just switch membership
                await prisma.householdMember.delete({ where: { userId: user.id } });
              }
            }

            // Join the invited household
            await prisma.householdMember.create({
              data: { userId: user.id, householdId: invite.householdId, role: "MEMBER" },
            });
          }
        } else {
          // Normal flow: auto-create household if user doesn't have one
          const existingMember = await prisma.householdMember.findUnique({
            where: { userId: user.id },
          });
          if (!existingMember) {
            const household = await prisma.household.create({
              data: { name: "My Household" },
            });
            await prisma.householdMember.create({
              data: { userId: user.id, householdId: household.id, role: "OWNER" },
            });
          }
        }

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
        const member = await prisma.householdMember.findUnique({
          where: { userId: user.id },
          select: { householdId: true },
        });
        token.householdId = member?.householdId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.householdId = token.householdId as string;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
