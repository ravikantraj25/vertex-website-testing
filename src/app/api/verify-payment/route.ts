import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json()

  // Verify signature — THIS IS THE SECURITY STEP
  const body = razorpayOrderId + "|" + razorpayPaymentId
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex")

  if (expectedSignature !== razorpaySignature) {
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 })
  }

  // Update payment record
  await prisma.payment.update({
    where: { razorpayOrderId },
    data: {
      razorpayPaymentId,
      razorpaySignature,
      status: "SUCCESS",
    }
  })

  // Update all linked participations to CONFIRMED
  // ...

  return NextResponse.json({ success: true })
}