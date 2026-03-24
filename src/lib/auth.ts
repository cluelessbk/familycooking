import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

// Lazy-init so the build doesn't crash when RESEND_API_KEY is missing
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "resend",
      name: "Email",
      type: "email",
      maxAge: 60 * 60, // 1 hour
      sendVerificationRequest: async ({ identifier: email, url }) => {
        // Plain text only — Resend's HTML click tracking rewrites URLs
        // and breaks magic links
        await getResend().emails.send({
          from: "FamilyCooking <noreply@resend.dev>",
          to: email,
          subject: "Sign in to FamilyCooking",
          text: `Sign in to FamilyCooking by clicking this link:\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.`,
        });
      },
    },
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      // Only allow emails in the AllowedEmail table
      const allowed = await prisma.allowedEmail.findUnique({
        where: { email: user.email },
      });
      return !!allowed;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
