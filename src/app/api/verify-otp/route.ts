import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export async function POST(req: NextRequest) {
  const { email, otp } = (await req.json()) as VerifyOtpRequest;

  const record = await prisma.otp.findUnique({
    where: { email },
  });

  if (!record) {
    return NextResponse.json(
      { error: "OTP not found" },
      { status: 400 }
    );
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "OTP expired" },
      { status: 400 }
    );
  }

  if (record.otp !== otp) {
    return NextResponse.json(
      { error: "Invalid OTP" },
      { status: 400 }
    );
  }

  // ✅ Delete OTP after successful verification
  await prisma.otp.delete({
    where: { email },
  });

  return NextResponse.json({ status: 200, message: "Email verified" });
}