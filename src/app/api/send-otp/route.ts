import { NextResponse, NextRequest } from "next/server";
import { transporter } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

interface SendOtpRequest {
  email: string;
}

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as SendOtpRequest;

  if (!email) {
    return NextResponse.json(
      { error: "Email required" },
      { status: 400 }
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  // Upsert OTP (replace old if exists)
  await prisma.otp.upsert({
    where: { email },
    update: {
      otp,
      expiresAt: expires,
    },
    create: {
      email,
      otp,
      expiresAt: expires,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Event OTP",
    html: `
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });

  return NextResponse.json({ status: 200, message: "OTP sent" });
}