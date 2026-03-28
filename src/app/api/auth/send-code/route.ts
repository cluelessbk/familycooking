import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body?.email as string | undefined;

  if (!email || typeof email !== "string") {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  // Rate limit: block if a token was created < 60 seconds ago
  const recent = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      expires: { gt: new Date(Date.now() - 60 * 1000) },
    },
    orderBy: { expires: "desc" },
  });

  if (recent) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store token (expires in 10 minutes)
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // Send email
  try {
    await getTransporter().sendMail({
      from: `"FamilyCooking" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Твоят код за вход в FamilyCooking",
      text: `Твоят код за вход в FamilyCooking е: ${code}\n\nКодът е валиден 10 минути.`,
    });
  } catch {
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
