import { headers } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();

  // ── Bug 2 fix: await headers() ──────────────────────────────────────────
  const headersList = await headers();
  const razorpaySignature = headersList.get("x-razorpay-signature");

  if (!razorpaySignature) {
    return new Response("Missing signature", { status: 400 });
  }

  // ── Step 1: Verify signature ─────────────────────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);

  // ── Step 2: Route to handlers ────────────────────────────────────────────
  try {
    switch (event.event) {

      // ── Bug 3 fix: handle both authorized and captured ──────────────────
      case "payment.authorized": // fires in test mode
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        await handlePaymentSuccess(payment.order_id, payment.id);
        break;
      }

      // ── Bug 1 fix: use the function, remove inline duplicate ─────────────
      case "payment.failed": {
        const payment = event.payload.payment.entity;
        await handlePaymentFailed(payment.order_id);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Always return 200 — Razorpay retries on non-200 responses
    return new Response("Handler error", { status: 200 });
  }

  return new Response("ok", { status: 200 });
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handlePaymentSuccess(
  razorpayOrderId: string,
  razorpayPaymentId: string
) {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: {
      registration: {
        include: { participations: true },
      },
    },
  });

  if (!payment) {
    console.error(`Payment not found for orderId: ${razorpayOrderId}`);
    return;
  }

  // Idempotency guard — webhook can fire more than once
  if (payment.status === "SUCCESS") {
    console.log(`Payment ${razorpayOrderId} already processed, skipping`);
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        status: "SUCCESS",
        razorpayPaymentId,
      },
    }),
    prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CONFIRMED" },
    }),
  ]);

  // Send confirmation email here — outside transaction, non-critical
  // await sendConfirmationEmail(payment.registration.participantId)
}

async function handlePaymentFailed(razorpayOrderId: string) {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
  });

  if (!payment) {
    console.error(`Payment not found for orderId: ${razorpayOrderId}`);
    return;
  }

  // Idempotency guard
  if (payment.status === "FAILED") {
    console.log(`Payment ${razorpayOrderId} already marked failed, skipping`);
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { razorpayOrderId },
      data: { status: "FAILED" },
    }),
    prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CANCELLED" },
    }),
  ]);
}


// Three Things That Will Bite You If You Miss Them

// **1. Use `req.text()` not `req.json()`**

// Razorpay signs the *raw body string*. If Next.js parses it to JSON and you re-stringify it, the signature check will fail because whitespace and key ordering may differ. Always read the raw body first, verify signature, then `JSON.parse()` yourself.

// **2. Always return `200` even on handler errors**

// If your DB is down and you throw, return `200` anyway and log the error. If you return `500`, Razorpay will retry the webhook multiple times, and when your DB comes back up you'll process the same payment 3-4 times. Handle idempotency with the `if (payment.status === "SUCCESS") return` guard instead.

// **3. Register the URL in Razorpay Dashboard**

// Go to Razorpay Dashboard → Settings → Webhooks → Add URL:
// ```
// https://yourdomain.com/api/webhook/razorpay